interface CustomModalProps {
    animationType?: "slide" | "none" | "fade";
    visible: boolean;
    onClose: () => void;
    children?: any;
    full?: boolean;
    showCloseButton?: boolean;
    contentStyle?: any
}