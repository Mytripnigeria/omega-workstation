import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface Variation {
  id: string;
  name: string;
  priceModifier: number;
}

interface VariationGroup {
  name: string;
  required: boolean;
  options: Variation[];
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  variations?: VariationGroup[];
}

interface ItemVariationModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAddToCart: (item: MenuItem, selectedVariations: Record<string, Variation>) => void;
}

const ItemVariationModal = ({ item, onClose, onAddToCart }: ItemVariationModalProps) => {
  const [selectedVariations, setSelectedVariations] = useState<Record<string, Variation>>({});

  if (!item || !item.variations) return null;

  const handleSelectVariation = (groupName: string, variation: Variation) => {
    setSelectedVariations((prev) => ({
      ...prev,
      [groupName]: variation,
    }));
  };

  const allRequiredSelected = item.variations
    .filter((g) => g.required)
    .every((g) => selectedVariations[g.name]);

  const calculateTotal = () => {
    let total = item.price;
    Object.values(selectedVariations).forEach((v) => {
      total += v.priceModifier;
    });
    return total;
  };

  const handleAdd = () => {
    onAddToCart(item, selectedVariations);
    setSelectedVariations({});
    onClose();
  };

  return (
    <Dialog open={!!item} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{item.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {item.variations.map((group) => (
            <div key={group.name}>
              <div className="flex items-center gap-2 mb-3">
                <h4 className="font-medium text-foreground">{group.name}</h4>
                {group.required && (
                  <Badge variant="outline" className="text-xs">Required</Badge>
                )}
              </div>
              <div className="space-y-2">
                {group.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleSelectVariation(group.name, option)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                      selectedVariations[group.name]?.id === option.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedVariations[group.name]?.id === option.id
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        }`}
                      >
                        {selectedVariations[group.name]?.id === option.id && (
                          <Check className="w-3 h-3 text-primary-foreground" />
                        )}
                      </div>
                      <span className="text-foreground">{option.name}</span>
                    </div>
                    {option.priceModifier !== 0 && (
                      <span className="text-muted-foreground text-sm">
                        {option.priceModifier > 0 ? "+" : ""}£{option.priceModifier.toFixed(2)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex-1 text-left">
            <span className="text-muted-foreground text-sm">Total: </span>
            <span className="text-lg font-bold text-primary">£{calculateTotal().toFixed(2)}</span>
          </div>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="gradient-primary"
            onClick={handleAdd}
            disabled={!allRequiredSelected}
          >
            Add to Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ItemVariationModal;
