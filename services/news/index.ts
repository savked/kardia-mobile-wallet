import {ENDPOINT_GATEWAY} from '../config';
import {requestWithTimeOut} from '../util';

export const getNews = async (): Promise<News[]> => {
  const options = {
    method: 'GET',
  };
  const response = await requestWithTimeOut(
    fetch(`${ENDPOINT_GATEWAY}news`, options),
    10 * 1000,
  );
  const responseJSON = await response.json();
  return responseJSON.data
    ? responseJSON.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        content: item.content || '',
        thumbnail: item.thumbnail,
        // thumbnail:
        //   'https://i.guim.co.uk/img/media/9e60e5e5886a7f8b0c8cbbd0d864446b25840907/0_283_5467_3280/master/5467.jpg?width=1200&height=900&quality=85&auto=format&fit=crop&s=4364b4ae7b9d9a5f0d661e2d263d24e6',
        url: item.url,
        createdAt: new Date(item.created_at * 1000),
        updatedAt: new Date(item.updated_at * 1000),
      }))
    : [];
};
