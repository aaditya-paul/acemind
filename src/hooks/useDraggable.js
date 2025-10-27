import { useState, useCallback, useEffect } from "react";

export const useDraggable = (elementRef, isDisabled = false) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback(
    (e) => {
      if (isDisabled) return;

      // Only allow dragging from the header area
      if (e.target.closest(".drag-handle")) {
        setIsDragging(true);
        setDragStart({
          x: e.clientX - position.x,
          y: e.clientY - position.y,
        });
      }
    },
    [position, isDisabled]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging || isDisabled) return;

      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      // Constrain to viewport
      const maxX = window.innerWidth - (elementRef.current?.offsetWidth || 400);
      const maxY =
        window.innerHeight - (elementRef.current?.offsetHeight || 600);

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    },
    [isDragging, dragStart, isDisabled, elementRef]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Reset position when maximized
  useEffect(() => {
    if (isDisabled) {
      setPosition({ x: 0, y: 0 });
    }
  }, [isDisabled]);

  return { position, handleMouseDown, isDragging };
};
