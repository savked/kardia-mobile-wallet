interface ListItemProps {
  label: string;
  value: any;
  onSelect?: () => void;
}

interface ListProps {
  items: ListItemProps[] | any[];
  selectedIndex?: number;
  loading?: boolean;
  loadingSize?: number | 'large' | 'small';
  loadingColor?: string;
  keyExtractor?: (item: any) => string;
  onSelect?: (itemIndex: number) => void;
  render?: (item: any, index: number) => any;
  initialNumToRender?: number;
  header?: any;
  ItemSeprator?: any;
  listStyle?: Record<string, any>;
  containerStyle?: Record<string, any>;
  ListEmptyComponent?: any;
  numColumns?: number;
}
