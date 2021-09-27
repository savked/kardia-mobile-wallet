interface SelectModalProps {
  headline?: string;
  value?: Record<string, any>;
  onSelect: (value: any) => void;
  renderItem: (item: any, index: number) => any;
  renderSelected: (item: any) => any;
  item: Record<string, any>[];
  message?: string
  searchPlaceHolder?: string
}
