import React, {useContext} from 'react';
import {Text, View, Image} from 'react-native';
import {FlatList, TouchableOpacity} from 'react-native-gesture-handler';
import {styles} from './style';
import {ThemeContext} from '../../App';

const NewsScreen = () => {
  const theme = useContext(ThemeContext);

  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <View style={styles.header}>
        <Text style={[styles.headline, {color: theme.textColor}]}>News</Text>
      </View>
      <View style={styles.highlight}>
        <Image
          style={styles.highlightImg}
          source={{
            uri:
              'https://miro.medium.com/max/12000/1*OFzM1PiAeoUCXFYsbqid1Q.jpeg',
          }}
        />
        <Text style={[styles.title, {color: theme.textColor}]}>
          5 Visual design tools for UX designers
        </Text>
        <Text style={[styles.time, {color: theme.textColor}]}>4 hours ago</Text>
      </View>
      <FlatList
        data={data}
        renderItem={({item}) => {
          return (
            <TouchableOpacity>
              <View style={styles.row}>
                <View style={styles.left}>
                  <Image
                    style={styles.thumbnail}
                    source={{
                      uri:
                        'https://i.guim.co.uk/img/media/9e60e5e5886a7f8b0c8cbbd0d864446b25840907/0_283_5467_3280/master/5467.jpg?width=1200&height=900&quality=85&auto=format&fit=crop&s=4364b4ae7b9d9a5f0d661e2d263d24e6',
                    }}
                  />
                </View>
                <View style={styles.right}>
                  <Text style={[styles.title, {color: theme.textColor}]}>
                    {item.Title}
                  </Text>
                  <Text style={[styles.description, {color: theme.textColor}]}>
                    {item.Description}
                  </Text>
                  <Text style={[styles.time, {color: theme.textColor}]}>
                    4 hours ago
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item.Title}
        ListEmptyComponent={<Text>No data</Text>}
      />
    </View>
  );
};

const data = [
  {
    Title: '5 Visual design tools for UX designers',
    Description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit',
  },
  {
    Title: '4 Visual design tools for UX designers',
    Description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit',
  },
  {
    Title: '3 Visual design tools for UX designers',
    Description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit',
  },
];

export default NewsScreen;
