interface CustomTextInputProps {
  onChangeText?: (newText: string) => void;
  value?: string;
  iconName?: string;
  onIconPress?: () => void;
  headline?: string;
  style?: Record<string, any>;
  numberOfLines?: number;
  multiline?: boolean;
  editable?: boolean;
  placeholder?: string;
  block?: boolean;
}
