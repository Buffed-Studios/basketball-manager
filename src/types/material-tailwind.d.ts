// @material-tailwind/react was built against @types/react v18, which included
// placeholder, onResize, onResizeCapture, onPointerEnterCapture, and
// onPointerLeaveCapture on all HTML elements. React 19 removed them, causing
// Material Tailwind components to demand them as required props.
// This augmentation restores them as optional so components work without noise.
import type {} from '@material-tailwind/react';

declare module '@material-tailwind/react' {
  interface ButtonProps {
    placeholder?: unknown;
    onResize?: unknown;
    onResizeCapture?: unknown;
    onPointerEnterCapture?: unknown;
    onPointerLeaveCapture?: unknown;
  }
}
