import { Delete, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PinPadProps {
  pin: string;
  onPinChange: (pin: string) => void;
  onSubmit: () => void;
  maxLength?: number;
}

const PinPad = ({ pin, onPinChange, onSubmit, maxLength = 4 }: PinPadProps) => {
  const handleNumberClick = (num: string) => {
    if (pin.length < maxLength) {
      onPinChange(pin + num);
    }
  };

  const handleDelete = () => {
    onPinChange(pin.slice(0, -1));
  };

  const handleClear = () => {
    onPinChange("");
  };

  const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  return (
    <div className="flex flex-col items-center gap-6">
      {/* PIN Display */}
      <div className="flex gap-3">
        {Array.from({ length: maxLength }).map((_, i) => (
          <div
            key={i}
            className={`w-12 h-14 sm:w-14 sm:h-16 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all duration-200 ${
              i < pin.length
                ? "border-primary bg-primary/20 text-primary"
                : "border-border bg-secondary/50"
            }`}
          >
            {i < pin.length ? "•" : ""}
          </div>
        ))}
      </div>

      {/* Number Pad */}
      <div className="grid grid-cols-3 gap-3">
        {numbers.map((num) => (
          <Button
            key={num}
            variant="secondary"
            className="pin-button bg-secondary hover:bg-secondary/80 text-foreground"
            onClick={() => handleNumberClick(num)}
          >
            {num}
          </Button>
        ))}
        
        {/* Bottom row */}
        <Button
          variant="ghost"
          className="pin-button text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          onClick={handleClear}
        >
          C
        </Button>
        <Button
          variant="secondary"
          className="pin-button bg-secondary hover:bg-secondary/80 text-foreground"
          onClick={() => handleNumberClick("0")}
        >
          0
        </Button>
        <Button
          variant="ghost"
          className="pin-button text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleDelete}
        >
          <Delete className="w-6 h-6" />
        </Button>
      </div>

      {/* Submit Button */}
      <Button
        className="w-full max-w-xs h-14 text-lg font-semibold gradient-primary hover:opacity-90 transition-opacity"
        onClick={onSubmit}
        disabled={pin.length !== maxLength}
      >
        Sign In
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
};

export default PinPad;
