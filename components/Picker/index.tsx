import React, { useContext } from 'react';
import RNPickerSelect, { Item } from 'react-native-picker-select';
import Icon from 'react-native-vector-icons/Feather';
import { ThemeContext } from '../../ThemeContext';
import CustomText from '../Text';
import { pickerSelectStyles, styles } from './style';

const Picker = ({
  headline,
  items,
  value,
  placeholder,
  onChange,
}: PickerProps & {items: Item[]; placeholder?: {} | Item}) => {
  const theme = useContext(ThemeContext);
  return (
    <>
      {headline && (
        <CustomText style={[styles.headline, {color: theme.textColor}]}>
          {headline}
        </CustomText>
      )}
      <RNPickerSelect
        style={pickerSelectStyles}
        value={value}
        onValueChange={onChange}
        placeholder={placeholder}
        items={items}
        Icon={() => {
          return <Icon name="chevron-down" size={30} />;
        }}
      />
    </>
  );
};

export default Picker;
