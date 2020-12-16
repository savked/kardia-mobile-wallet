import React from 'react';
import {Text, View} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import ListItem from './ListItem';
import {styles} from './style';

// const ItemSeprator = () => <View style={styles.separator} />

const List = ({
  items,
  render,
  onSelect,
  initialNumToRender,
  header,
  ItemSeprator,
  listStyle,
  containerStyle,
  ListEmptyComponent,
  keyExtractor = (item) => item.value,
  numColumns = 1,
}: ListProps) => {
  return (
    <>
      {header && <View style={[styles.list, listStyle]}>{header}</View>}
      <FlatList
        contentContainerStyle={containerStyle}
        style={[styles.list, listStyle]}
        data={items}
        renderItem={({item, index}) => {
          if (render) {
            return render(item, index);
          }
          return (
            <ListItem
              key={`item-${index}`}
              label={(item as ListItemProps).label}
              value={(item as ListItemProps).value}
              onSelect={() => {
                onSelect && onSelect(index);
              }}
            />
          );
        }}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={ItemSeprator || null}
        ListEmptyComponent={ListEmptyComponent || <Text>No data</Text>}
        initialNumToRender={initialNumToRender || 5}
        numColumns={numColumns}
        // ListHeaderComponent={header}
      />
    </>
  );
};

export default List;
