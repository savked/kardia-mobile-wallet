interface ListItemProps {
  label: string;
  value: any;
  onSelect?: () => void;
}

interface ListProps {
  items: ListItemProps[] | any[];
  selectedIndex?: number;
  keyExtractor?: (item: any) => string;
  onSelect?: (itemIndex: number) => void;
  render?: (item: any, index: number) => any;
  initialNumToRender?: number;
  header?: any;
  ItemSeprator?: any;
  listStyle?: Record<string, any>;
  ListEmptyComponent?: any;
}
