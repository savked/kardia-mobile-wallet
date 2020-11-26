interface ListItemProps {
    label: string;
    value: any;
    onSelect?: () => void
}

interface ListProps {
    items: ListItemProps[];
    selectedIndex?: number;
    onSelect?: (itemIndex: number) => void
    render?: (item: any, index: number) => any;
    initialNumToRender?: number;
    header?: any;
}