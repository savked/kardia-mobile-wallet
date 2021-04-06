interface CustomModalProps {
  animationType?: 'slide' | 'none' | 'fade' | 'none';
  visible: boolean;
  onClose: () => void;
  children?: any;
  full?: boolean;
  showCloseButton?: boolean;
}
