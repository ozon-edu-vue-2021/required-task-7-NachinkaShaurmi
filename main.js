const details = document.querySelector("#container .details-view");
const background = document.querySelector(".background");
const contactsList = document.querySelector(".contacts-list");
const back = document.querySelector(".back");

const friendsList = document.querySelector("#friends");
const noFriendsList = document.querySelector("#no-friends");
const popularList = document.querySelector("#popular");

const SUB_LISTS = {
  TYPES: {
    FRIENDS: "Друзья",
    NO_FRIENDS: "Не в друзья",
    POPULAR: "Популярные люди",
  },
  LIMIT_LENGTH: 3,
}

const start = async (cb) => {
  try {
    const res = await fetch("./data.json");
    const data = await res.json();
    cb(data);
  } catch (error) {
    throw new Error("Network error")
  }
};

let dataFromBack;
const setData = (arr) => {
  dataFromBack = arr;
};

const memoize = (fn) => {
  const cache = {};
  return (...args) => {
    const n = args[1];
    if (n in cache) {
      return cache[n];
    } else {
      const result = fn(...args);
      cache[n] = result;
      return result;
    }
  };
};

const exclude = (arr, length, maxValue) => {
  const res = [];
  for (let i = 1; i <= length; i++) {
    if (!arr.includes(i)) res.push(i);
    if (maxValue && maxValue === res.length) return res;
  }
  return res;
};

const findByIndex = (list, id) => list.find((el) => +el.id === +id);
const findByIndexMemo = memoize(findByIndex);

const titleList = (title) => `<li class="people-title">${title}</li>`;

const renderCommonList = (listFromBack) => {
  const contactsListElements = listFromBack.map(
    (el) => `<li id=${el.id}><strong>${el.name}</strong></li>`
  );
  contactsList.innerHTML = contactsListElements.join("");
};

const renderSubList = (idArray, title, parentEl, peoplesList) => {
  const peoples = idArray?.map(
    (el) =>
      `<li><i class="fa fa-male"></i><span>${
        findByIndexMemo(peoplesList, el).name
      }</span></li>`
  );
  parentEl.innerHTML = titleList(title) + peoples.join("");
};

const dataCreator = (arr) => {
  let data = {};
  if (arr?.length) {
    data = arr.reduce(
      (acc, el) => {
        el.friends.forEach((friend) => {
          acc.top[friend] ? (acc.top[friend] += 1) : (acc.top[friend] = 1);
        });
        const elWithNoFriends = {
          ...el,
          noFriends: exclude(el.friends, arr.length, SUB_LISTS.LIMIT_LENGTH),
        };
        acc.list.push(elWithNoFriends);
        return acc;
      },
      { top: {}, list: [] }
    );
  }
  return data;
};

const topCreator = (data) => {
  let top = [];
  if (data.top)
    top = Object.entries(data.top)
      .sort((a, b) => {
        if (a[1] !== b[1]) return b[1] - a[1];
        if (
          findByIndexMemo(data.list, a[0]).name >=
          findByIndexMemo(data.list, b[0]).name
        )
          return 1;
        return -1;
      })
      .slice(0, SUB_LISTS.LIMIT_LENGTH)
      .map((el) => el[0]);

  return top;
};

const createLayout = (dataFromBack) => {
  const data = dataCreator(dataFromBack);
  const top = topCreator(data);
  let current = null;

  renderCommonList(data.list);

  contactsList.addEventListener("click", (e) => {

    const currentId = e.target.closest("li").id;
    current = findByIndexMemo(data.list, currentId);
    const { name, friends: friendsIdArray, noFriends } = current;

    renderSubList(friendsIdArray, SUB_LISTS.TYPES.FRIENDS, friendsList, data.list);
    renderSubList(noFriends, SUB_LISTS.TYPES.NO_FRIENDS, noFriendsList, data.list);
    renderSubList(top, SUB_LISTS.TYPES.POPULAR, popularList, data.list);

    background.innerHTML = name;
    details.style.zIndex = 1;
  });

  back.addEventListener("click", () => {
    details.style.zIndex = 0;
    current = null;
  });
};

start(setData).then(() => createLayout(dataFromBack)).catch((error) => console.error(error));
