interface AlertModal {
  type: 'success' | 'error' | 'warning';
  message?: string;
  onOK?: () => void;
  onCancel?: () => void;
  visible: boolean;
  onClose: () => void;
  children?: any;
}
