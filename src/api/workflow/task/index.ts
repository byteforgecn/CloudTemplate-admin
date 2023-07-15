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
 * 当前租户所有待办任务
 * @param query
 * @returns {*}
 */
export const getAllTaskWaitByPage = (query: object) => {
  return request({
    url: '/workflow/task/getAllTaskWaitByPage',
    method: 'get',
    params: query
  });
};

/**
 * 当前租户所有已办任务
 * @param query
 * @returns {*}
 */
export const getAllTaskFinishByPage = (query: object) => {
  return request({
    url: '/workflow/task/getAllTaskFinishByPage',
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

/**
 * 任务驳回
 * @param taskId
 * @returns {*}
 */
export const backProcess = (data: object) => {
  return request({
    url: '/workflow/task/backProcess',
    method: 'post',
    data: data
  });
};

/**
 * 获取流程状态
 * @param taskId 
 * @returns 
 */
export const getBusinessStatus = (taskId: string) => {
  return request({
    url: '/workflow/task/getBusinessStatus/' + taskId,
    method: 'get'
  });
};

/**
 * 加签
 * @param data 
 * @returns 
 */
export const addMultiInstanceExecution = (data: object) => {
  return request({
    url: '/workflow/task/addMultiInstanceExecution',
    method: 'post',
    data: data
  });
};

/**
 * 减签
 * @param data 
 * @returns 
 */
export const deleteMultiInstanceExecution = (data: object) => {
  return request({
    url: '/workflow/task/deleteMultiInstanceExecution',
    method: 'post',
    data: data
  });
};

