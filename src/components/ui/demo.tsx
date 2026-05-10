import { Input } from "@/components/ui/input";
import { StarsBackground } from "@/components/ui/stars";

const DemoOne = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Input name="email" placeholder="john.doe@gmail.com" />
    </div>
  );
};

function StarsBackgroundExample() {
  return (
    <StarsBackground className="flex h-screen w-full items-center justify-center">
      <div className="flex h-screen w-full items-center justify-center">
        <div className="font-sans text-7xl font-bold text-[#444444]">
          Stars
        </div>
      </div>
    </StarsBackground>
  );
}

export { DemoOne, StarsBackgroundExample };
