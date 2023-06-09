<!--
 * @Author: 黄叶
 * @Date: 2023-04-18 23:33:34
 * @LastEditTime: 2023-06-13 00:10:17
 * @FilePath: /schoolWall/src/views/home/home.vue
 * @Description: 
-->

<template>
  <div class="h-screen overflow-auto"  @scroll="containerScrollhandle($event)">
    <DeTabs
      class="sticky top-0 block mb-4 z-10"
      tab-class="px-6 "
      :list="tabList"
      :selected-index="tabsSelectIndex"
      @change-index="($event) => (tabsSelectIndex = $event)"
    />
    <div class="px-3 overflow-auto">
      <!-- 有数据 -->
      <n-spin :show="isLoading">
        <ContentBox
          v-if="postsData.length > 0"
          :content-data="postsData"
          @change-like-status-index="changeLikeStatus"
          @box-click="goToPostPage($event)"
        />

        <!-- 无数据 -->
        <div
          v-if="postsData.length == 0"
          class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <div class="text-4.5 text-gray-4">暂无数据</div>
        </div>
      </n-spin>
    </div>
    <!-- 弹窗和悬浮按钮 -->
    <FormEditBox
      :show="isFormEditBoxShow"
      @close="() => (isFormEditBoxShow = false)"
      @submit="submitPost"
    />
    <FloatingButton
      class="right-5 bottom-40 transition duration-600 ease-in-out"
      :class="[showFloatingButton ? 'translate-y-0' : 'translate-y-60']"
      v-if="!isFormEditBoxShow"
      @click="isFormEditBoxShow = true"
    >
      <svg
        class="w-6 h-6"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 1024 1024"
      >
        <defs></defs>
        <path
          d="M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z"
          fill="currentColor"
        ></path>
        <path
          d="M176 474h672q8 0 8 8v60q0 8-8 8H176q-8 0-8-8v-60q0-8 8-8z"
          fill="currentColor"
        ></path>
      </svg>
    </FloatingButton>
  </div>
</template>

<script setup>
import timeFormat from "../../utils/timeFormat";
import postApi from "../../api/post";
import ContentBox from "../../components/newUI/ContentBox.vue";
import FloatingButton from "../../components/FloatingButton.vue";
import FormEditBox from "../../components/FormEditBox.vue";
import DeTabs from "../../components/newUI/DeTabs.vue";
import router from "../../router/router";
import { useUserStore } from "../../store/userStore";

const userStore = useUserStore();

//"我发", "我回", "我赞", "新回", "新发", "精选", "热榜"
const tabList = ["我发", "我回", "我赞", "新回", "新发"];

/**
 * 帖子文本格式化
 * @param {*} text 帖子文本
 */
const textWraFormat = (text) => {
  return text.replace(/\n/g, "<br>");
};

/**
 * 帖子数据格式化
 */
const postDataFormat = (postData) => {
  if (postData != null) {
    postData.reverse();
    postData.forEach((data) => {
      data.text = textWraFormat(data.text);
      data.createTime = timeFormat.getFormateTime(data.createTime);
      data.updateTime = timeFormat.getFormateTime(data.updateTime);
      data.images = data.images.split(",");
      if (data.isTop == 1) {
        postData.unshift(postData.splice(postData.indexOf(data), 1)[0]);
      }
    });
    console.log(postData);
  }
  return postData;
};

/**
 * 我发
 */
let userPostsData = null;
const getUserPosts = async () => {
  const res = await postApi.getPostByLoginUserId();
  if (res.code == 200) {
    if (res.data == null) {
      return [];
    }
    return postDataFormat(res.data);
  }
};

/**
 * 我回
 */
let userRepliedPostsData = null;
const getUserRepliedPosts = async () => {
  const res = await postApi.getRepliedPostsByUserId();
  if (res.code == 200) {
    if (res.data == null) {
      return [];
    }
    return postDataFormat(res.data);
  }
};

/**
 * 我赞
 */
let userLikedPostsData = null;
const getUserLikedPosts = async () => {
  const res = await postApi.getLikedPostsByUserId();
  if (res.code == 200) {
    if (res.data == null) {
      return [];
    }
    return postDataFormat(res.data);
  }
};

/**
 * 新回
 */
let latestRepliedPostData = null;
const getLatestRepliedPost = async () => {
  let res = null;
  if (localStorage.getItem("token") == null) {
    res = await postApi.getAllPost();
  } else {
    res = await postApi.getAllPostByLogin();
  }
  if (res.code == 200) {
    if (res.data == null) {
      return [];
    }
    res.data.sort((pre, cur) => {
      return pre.updateTime - cur.updateTime;
    });
    return postDataFormat(res.data);
  }
};

/**
 * 新发
 */
let latestPostsData = null;
const getLatestPosts = async () => {
  let res = null;
  if (localStorage.getItem("token") == null) {
    res = await postApi.getAllPost();
  } else {
    res = await postApi.getAllPostByLogin();
  }
  if (res.code == 200) {
    if (res.data == null) {
      return [];
    }
    return postDataFormat(res.data);
  }
};

/**
 * 帖子数据
 */
const postsData = ref([]);

//tabs下标
const tabsSelectIndex = ref(3);
const isLoading = ref(false); //是否正在加载
watchEffect(async () => {
  isLoading.value = true;
  switch (tabsSelectIndex.value) {
    case 0:
      if (userPostsData != null) {
        postsData.value = userPostsData;
      } else {
        postsData.value = await getUserPosts();
        userPostsData = postsData.value;
      }
      break;
    case 1:
      if (userRepliedPostsData != null) {
        postsData.value = userRepliedPostsData;
      } else {
        postsData.value = await getUserRepliedPosts();
        userRepliedPostsData = postsData.value;
      }
      break;
    case 2:
      if (userLikedPostsData != null) {
        postsData.value = userLikedPostsData;
      } else {
        postsData.value = await getUserLikedPosts();
        userLikedPostsData = postsData.value;
      }
      break;
    case 3:
      if (latestRepliedPostData != null) {
        postsData.value = latestRepliedPostData;
      } else {
        postsData.value = await getLatestRepliedPost();
        latestRepliedPostData = postsData.value;
      }
      break;
    case 4:
      if (latestPostsData != null) {
        postsData.value = latestPostsData;
      } else {
        postsData.value = await getLatestPosts();
        latestPostsData = postsData.value;
      }
      break;
  }
  console.log(postsData.value);
  isLoading.value = false;
  showFloatingButton.value = true;
});

/**
 * 修改点赞状态
 * @param {*} index 帖子在数组中的下标
 */
const changeLikeStatus = async (index) => {
  if (
    postsData.value[index].likeStatus == 0 ||
    postsData.value[index].likeStatus == null
  ) {
    const res = await postApi.likePost(postsData.value[index].id);
    ElMessage.success(res.data);
    postsData.value[index].likeStatus = 1;
    postsData.value[index].likes++;
  } else {
    const res = await postApi.unlikePost(postsData.value[index].id);
    ElMessage.success(res.data);
    console.log(res);
    postsData.value[index].likeStatus = 0;
    postsData.value[index].likes--;
  }
};

/**
 * 跳转到具体的帖子页面
 * @param {number} id 帖子id
 */

const goToPostPage = (id) => {
  if (localStorage.getItem("token") == null) {
    window.$dialog.warning({
      title: "需要登录",
      content: "查看内容需要登录",
      positiveText: "前往登录",
      negativeText: "我再看看",
      style: "border-radius: 10px;",
      positiveStyle: "border-radius: 10px;",
      // loading: true,
      // 确认按钮的属性
      positiveButtonProps: {
        ghost: false,
        style: "border-radius: 8px; background-color: #f0a020",
      },
      //取消按钮的属性
      negativeButtonProps: {
        dashed: true,
        style: "border-radius: 8px;",
      },
      onPositiveClick: () => {
        router.push("/login");
      },
      onNegativeClick: () => {
        // message.error("不确定");
      },
    });
  } else {
    router.push(`/post/${id}`);
  }
};

const isFormEditBoxShow = ref(false);
/**
 * 发布新帖子
 * @param {*} formData 表单数据
 */
const submitPost = async (formData, uploadHandle) => {
  if (formData.text == null || formData.text == "") {
    ElMessage.error("内容不能为空");
    return;
  }

  const images = await uploadHandle();

  let imagesFormat = "";
  if (images != null) {
    images.forEach((item) => {
      imagesFormat == ""
        ? (imagesFormat = item.replace(/[\[\]\"]/g, ""))
        : (imagesFormat += "," + item.replace(/[\[\]\"]/g, ""));
    });

    console.log(images);
  }

  formData.images = imagesFormat == "" ? null : imagesFormat;

  const res = await postApi.addPost(formData);
  console.log(res);
  if (res.code == 200) {
    res.data = {
      ...res.data,
      nickname: userStore.user.nickname,
      likes: 0,
      replies: 0,
      createTime: "片刻之前",
      text: textWraFormat(res.data.text),
      avatar: userStore.user.avatar,
      images: imagesFormat.split(","),
    };
    tabsSelectIndex.value = 3;
    postsData.value.unshift(res.data);
    ElMessage.success("发布成功");
  } else {
    ElMessage.error("发布失败");
  }
};

// 是否显示浮动按钮
const showFloatingButton = ref(false);
let oldScrollTop = 0; //上一次滚动的距离
/**
 * 监听滚动事件，控制浮动按钮的显示与隐藏
 * @param {*} event
 */
const containerScrollhandle = (event) => {
  if (!event.target) return;
  const curScrollTop = event.target.scrollTop;
  showFloatingButton.value = curScrollTop < oldScrollTop;
  oldScrollTop = curScrollTop;
};

onMounted(() => {
  
});
onBeforeMount(() => {
  // tabsSelectIndex.value = 3;
});
</script>

<style scoped></style>
