import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { TaskQuery, TaskVO } from '@/api/workflow/task/types';
/**
 * 查询待办列表
 * @param query
 * @returns {*}
 */
export const getPageByTaskWait = (query: TaskQuery): AxiosPromise<TaskVO[]> => {
  return request({
    url: '/workflow/task/getPageByTaskWait',
    method: 'get',
    params: query
  });
};

/**
 * 查询已办列表
 * @param query
 * @returns {*}
 */
export const getPageByTaskFinish = (query: TaskQuery): AxiosPromise<TaskVO[]> => {
  return request({
    url: '/workflow/task/getPageByTaskFinish',
    method: 'get',
    params: query
  });
};

/**
 * 查询当前用户的抄送列表
 * @param query
 * @returns {*}
 */
export const getPageByTaskCopy = (query: TaskQuery): AxiosPromise<TaskVO[]> => {
  return request({
    url: '/workflow/task/getPageByTaskCopy',
    method: 'get',
    params: query
  });
};

/**
 * 当前租户所有待办任务
 * @param query
 * @returns {*}
 */
export const getPageByAllTaskWait = (query: TaskQuery): AxiosPromise<TaskVO[]> => {
  return request({
    url: '/workflow/task/getPageByAllTaskWait',
    method: 'get',
    params: query
  });
};

/**
 * 当前租户所有已办任务
 * @param query
 * @returns {*}
 */
export const getPageByAllTaskFinish = (query: TaskQuery): AxiosPromise<TaskVO[]> => {
  return request({
    url: '/workflow/task/getPageByAllTaskFinish',
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
 * 获取当前任务
 * @param taskId
 * @returns
 */
export const getTaskById = (taskId: string) => {
  return request({
    url: '/workflow/task/getTaskById/' + taskId,
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

/**
 * 修改任务办理人
 * @param taskIds
 * @param userId
 * @returns
 */
export const updateAssignee = (taskIds: Array<string>,userId: string) => {
  return request({
    url: `/workflow/task/updateAssignee/${taskIds}/${userId}`,
    method: 'put'
  });
};

/**
 * 转办任务
 * @param taskIds
 * @param userId
 * @returns
 */
export const transferTask = (data: object) => {
  return request({
    url: `/workflow/task/transferTask`,
    method: 'post',
    data: data
  });
};
