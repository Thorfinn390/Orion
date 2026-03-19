import { cssInterop } from "nativewind";
import React from "react";
import * as Animatable from "react-native-animatable";

const AnimatableView = Animatable.View;
cssInterop(AnimatableView, {
  className: "style",
});

interface SkeletonProps {
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <AnimatableView
      animation="pulse"
      easing="ease-in-out"
      iterationCount="infinite"
      className={`bg-gray-200/80 dark:bg-gray-700/80 rounded-md ${className}`}
    />
  );
};

export default Skeleton;
