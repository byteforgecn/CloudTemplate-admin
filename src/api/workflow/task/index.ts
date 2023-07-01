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

/**
 * 启动流程
 * @param data
 * @returns {*}
 */
export const startWorkFlow = (data: object) => {
  return request({
    url: '/workflow/task/startWorkFlow',
    method: 'post',
    data: data
  });
};

/**
 * 办理流程
 * @param data
 * @returns {*}
 */
export const completeTask = (data: object) => {
  return request({
    url: '/workflow/task/completeTask',
    method: 'post',
    data: data
  });
};

/**
 * 认领任务
 * @param taskId
 * @returns {*}
 */
export const claim = (taskId: string) => {
  return request({
    url: '/workflow/task/claim/' + taskId,
    method: 'post'
  });
};

/**
 * 归还任务
 * @param taskId
 * @returns {*}
 */
export const returnTask = (taskId: string) => {
  return request({
    url: '/workflow/task/returnTask/' + taskId,
    method: 'post'
  });
};


