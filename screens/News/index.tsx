import React, {useContext, useEffect, useState} from 'react';
import {Text, View, Image, ActivityIndicator, Linking} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {FlatList, TouchableOpacity} from 'react-native-gesture-handler';
import {styles} from './style';
import {ThemeContext} from '../../App';
import {
  getDateFNSLocale,
  getDateTimeFormat,
  getLanguageString,
} from '../../utils/lang';
import {useRecoilValue} from 'recoil';
import {languageAtom} from '../../atoms/language';
import {getNews} from '../../services/news';
import {format, formatDistanceToNowStrict, isSameDay} from 'date-fns';
import CustomText from '../../components/Text';

const NewsScreen = () => {
  const theme = useContext(ThemeContext);
  const language = useRecoilValue(languageAtom);
  const [news, setNews] = useState<News[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const rs = await getNews();
        setNews(rs);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  const openNews = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      // Opening the link with some app, if the URL scheme is "http" the web link should be opened
      // by some browser in the mobile
      await Linking.openURL(url);
    }
  };

  if (news.length === 0) {
    return (
      <SafeAreaView
        style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <View style={styles.header}>
        <CustomText  style={[styles.headline, {color: theme.textColor}]}>
          {getLanguageString(language, 'NEWS_SCREEN_TITLE')}
        </CustomText>
      </View>
      <TouchableOpacity
        style={styles.highlight}
        onPress={() => openNews(news[0].url)}>
        <Image
          style={styles.highlightImg}
          source={{
            uri: news[0].thumbnail,
          }}
        />
        <CustomText  style={[styles.title, {color: theme.textColor}]}>
          {news[0].title}
        </CustomText>
        <CustomText  style={[styles.time, {color: theme.textColor}]}>
          {isSameDay(news[0].createdAt, new Date())
            ? `${formatDistanceToNowStrict(news[0].createdAt, {
                locale: getDateFNSLocale(language),
              })} ${getLanguageString(language, 'AGO')}`
            : format(news[0].createdAt, getDateTimeFormat(language), {
                locale: getDateFNSLocale(language),
              })}
        </CustomText>
      </TouchableOpacity>
      <FlatList
        data={news.slice(1)}
        renderItem={({item}) => {
          return (
            <TouchableOpacity onPress={() => openNews(item.url)}>
              <View style={styles.row}>
                <View style={styles.left}>
                  <Image
                    style={styles.thumbnail}
                    source={{
                      uri: item.thumbnail,
                    }}
                  />
                </View>
                <View style={styles.right}>
                  <CustomText
                    style={[styles.title, {color: theme.textColor}]}
                    numberOfLines={2}>
                    {item.title}
                  </CustomText>
                  <CustomText
                    style={[styles.description, {color: theme.textColor}]}
                    numberOfLines={2}>
                    {item.description}
                  </CustomText>
                  <CustomText  style={[styles.time, {color: theme.textColor}]}>
                    {isSameDay(item.createdAt, new Date())
                      ? `${formatDistanceToNowStrict(item.createdAt, {
                          locale: getDateFNSLocale(language),
                        })} ${getLanguageString(language, 'AGO')}`
                      : format(item.createdAt, getDateTimeFormat(language), {
                          locale: getDateFNSLocale(language),
                        })}
                  </CustomText>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <CustomText  style={[styles.noTXText, {color: theme.textColor}]}>
            {getLanguageString(language, 'NO_TRANSACTION')}
          </CustomText>
        }
      />
    </SafeAreaView>
  );
};

export default NewsScreen;
