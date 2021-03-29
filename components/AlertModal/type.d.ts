interface AlertModal {
  type: 'success' | 'error' | 'warning' | 'confirm';
  message?: string;
  onOK?: () => void;
  cancelText?: string;
  okText?: string;
  visible: boolean;
  onClose: () => void;
  children?: any;
  iconSize?: number;
  iconColor?: string;
  okLoading?: boolean;
  okDisabled?: boolean;
  cancelLoading?: boolean;
  cancelDisabled?: boolean;
}
