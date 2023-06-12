import request from '@/utils/request';

/**
 * 查询待办列表
 * @param query
 * @returns {*}
 */
export const getTaskWaitByPage = (query: object) => {
  return request({
    url: '/workflow/task/getTaskWaitByPage',
    method: 'get',
    params: query
  });
};

/**
 * 查询已办列表
 * @param query
 * @returns {*}
 */
export const getTaskFinishByPage = (query: object) => {
  return request({
    url: '/workflow/task/getTaskFinishByPage',
    method: 'get',
    params: query
  });
};

