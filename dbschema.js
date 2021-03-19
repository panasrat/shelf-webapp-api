let db = {
  users: [
    {
      userId: '123456789',
      email: 'profile@email.com',
      handle: 'profile',
      createdAt: '2020-03-15T11:46:01.018Z',
      imageUrl: 'image/sdsadsad/sadsdsad',
      bio: 'Test profile',
      website: 'https://profile.com',
      location: 'London, UK',
    },
  ],
  items: [
    {
      userHandle: 'profile',
      body: 'i am an item',
      createdAt: '2020-03-15T11:46:01.018Z',
      likeCount: 5,
      commentCount: 2,
    },
  ],
  likes: [
    {
      itemId: 'sdnksnadkksd',
      userHandle: 'user',
    },
  ],
  comments: [
    {
      userHandle: 'user',
      itemId: 'sdnksnadkksd',
      body: 'test comment',
      createdAt: '2020-03-15T11:46:01.018Z',
    },
  ],
  notifications: [
    {
      recipient: 'user',
      sender: 'john',
      read: 'true | false',
      itemId: 'sdnksnadkksd',
      type: 'like | comment',
      createdAt: '2020-03-15T11:46:01.018Z',
    },
  ],
};

const userDetail = {
  credentials: {
    bio: 'Hello',
    userId: 'DNoPiMNmTMdTKj0rqAxEqaUgBi52',
    website: 'http://user.com',
    createdAt: '2021-03-15T09:41:28.182Z',
    imageUrl:
      'https://firebasestorage.googleapis.com/v0/b/shelf-webapp-de58d.appspot.com/o/97490993006.png?alt=media',
    location: 'Bangkok',
    email: 'user@email.com',
    handle: 'user',
  },
  likes: [
    {
      itemId: 'NYZJyLO7yPQYDz7f2ppR',
      userHandle: 'user',
    },
  ],
  notifications: [
    {
      recipient: 'user',
      sender: 'jane',
      createdAt: '2021-03-19T16:16:14.685Z',
      itemId: 'NYZJyLO7yPQYDz7f2ppR',
      type: 'comment',
      read: false,
      notificationId: 'W4jlpmB5yjOGY8bgspfr',
    },
  ],
};
