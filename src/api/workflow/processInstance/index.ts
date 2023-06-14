import request from '@/utils/request';
const baseUrl = import.meta.env.VITE_APP_BASE_API;
import { getToken } from '@/utils/auth';

/**
 * 通过流程实例id获取历史流程图
 */
export const getHistoryProcessImage = (processInstanceId: string) => {
  return baseUrl + `/workflow/processInstance/getHistoryProcessImage/${processInstanceId}` + '?Authorization=Bearer ' + getToken()+'&t'+ Math.random()
};

/**
 * 获取审批记录
 * @param processInstanceId 流程实例id
 * @returns
 */
export const getHistoryRecord = (processInstanceId: string) => {
  return request({
    url: `/workflow/processInstance/getHistoryRecord/${processInstanceId}`,
    method: 'get'
  });
};
