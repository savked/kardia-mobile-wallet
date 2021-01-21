interface IconButtonProps {
  name: string;
  disabled?: boolean;
  loading?: boolean;
  color?: string;
  size?: number;
  badge?: string | number;
  onPress?: () => void;
}
