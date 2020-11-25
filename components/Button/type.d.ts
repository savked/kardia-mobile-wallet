interface ButtonProps {
    onPress: () => void;
    title?: string;
    icon?: any;
    style?: any;
    textStyle?: any;
    iconName?: string;
    size?: "small" | "medium" | "large";
    type?: "primary" | "secondary" | "outline" | "ghost" | "link";
}