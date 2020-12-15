/* eslint-disable react-native/no-inline-styles */
import React, {useContext} from 'react';
import {View, Text, Image} from 'react-native';
import {FlatList, TouchableOpacity} from 'react-native-gesture-handler';
import {styles} from './style';
import {ThemeContext} from '../../App';
import {useRecoilValue} from 'recoil';
import {notificationAtom} from '../../atoms/notification';

const Notification = () => {
  const theme = useContext(ThemeContext);

  const notificationList = useRecoilValue(notificationAtom);

  function viewDetail() {
    console.log('view detail');
  }

  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
  function dateDiffInDays(earlyDate: Date, laterDate: Date) {
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(
      earlyDate.getFullYear(),
      earlyDate.getMonth(),
      earlyDate.getDate(),
    );
    const utc2 = Date.UTC(
      laterDate.getFullYear(),
      laterDate.getMonth(),
      laterDate.getDate(),
    );

    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
  }

  function convertSecondsToDate(seconds: number, format = 'h:m') {
    const _date = new Date(seconds * 1000);
    const day = _date.getDate() < 10 ? `0${_date.getDate()}` : _date.getDate();
    const month =
      _date.getMonth() + 1 < 10
        ? `0${_date.getMonth() + 1}`
        : _date.getMonth() + 1;
    const hours =
      _date.getHours() < 10 ? `0${_date.getHours()}` : _date.getHours();
    const minutes =
      _date.getMinutes() < 10 ? `0${_date.getMinutes()}` : _date.getMinutes();

    if (format === 'h:m') {
      return <Text style={styles.time}>{hours + ':' + minutes}</Text>;
    } else if (format === 'd/m h:m') {
      return (
        <Text style={styles.time}>
          {day + '/' + month + ' ' + hours + ':' + month}
        </Text>
      );
    }
  }

  const todayNotification = notificationList.filter(
    (item) => dateDiffInDays(item.date, new Date()) === 0,
  );

  const earlierNotification = notificationList.filter(
    (item) => dateDiffInDays(item.date, new Date()) !== 0,
  );

  return (
    <View
      style={{
        backgroundColor: theme.backgroundColor,
        flex: 1,
        justifyContent: 'flex-start',
      }}>
      <Text style={styles.headline}>Today</Text>
      {todayNotification.length > 0 && (
        <FlatList
          data={todayNotification}
          renderItem={({item}) => {
            return (
              <TouchableOpacity onPress={viewDetail}>
                <View style={styles.row}>
                  <View style={styles.left}>
                    <Image
                      style={styles.thumbnail}
                      source={{
                        uri: 'https://reactnative.dev/img/tiny_logo.png',
                      }}
                    />
                  </View>
                  <View style={styles.right}>
                    <Text style={[styles.title, {color: theme.textColor}]}>
                      {item.title}
                    </Text>
                    <Text
                      style={[styles.description, {color: theme.textColor}]}>
                      {item.description}
                    </Text>
                    {convertSecondsToDate(item.date.getTime())}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          keyExtractor={(item) => item.title}
          ListEmptyComponent={null}
        />
      )}

      <Text style={styles.headline}>Earlier</Text>
      {earlierNotification.length > 0 && (
        <FlatList
          data={earlierNotification}
          renderItem={({item}) => {
            return (
              <TouchableOpacity onPress={viewDetail}>
                <View
                  style={[
                    styles.row,
                    {backgroundColor: theme.backgroundFocusColor},
                  ]}>
                  <View style={styles.left}>
                    <Image
                      style={styles.thumbnail}
                      source={{
                        uri: 'https://reactnative.dev/img/tiny_logo.png',
                      }}
                    />
                  </View>
                  <View style={styles.right}>
                    <Text style={[styles.title, {color: theme.textColor}]}>
                      {item.title}
                    </Text>
                    <Text
                      style={[styles.description, {color: theme.textColor}]}>
                      {item.description}
                    </Text>
                    {convertSecondsToDate(item.date.getTime(), 'd/m h:m')}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          keyExtractor={(item) => item.title}
          ListEmptyComponent={null}
        />
      )}
    </View>
  );
};

export default Notification;
