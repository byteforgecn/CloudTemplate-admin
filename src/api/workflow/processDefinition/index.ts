import request from '@/utils/request';
const baseUrl = import.meta.env.VITE_APP_BASE_API;
import { getToken } from '@/utils/auth';

/**
 * 获取流程定义列表
 * @param processInstanceId 流程实例id
 * @returns
 */
export const listProcessDefinition = (query: object) => {
  return request({
    url: `/workflow/processDefinition/list`,
    method: 'get',
    params: query
  });
};
/**
 * 按照流程定义key获取流程定义
 * @param processInstanceId 流程实例id
 * @returns
 */
export const getProcessDefinitionListByKey = (key: string) => {
  return request({
    url: `/workflow/processDefinition/getProcessDefinitionListByKey/${key}`,
    method: 'get'
  });
};

/**
 * 通过流程定义id获取流程图
 */
export const processDefinitionImage = (processDefinitionId: string) => {
  return (
    baseUrl +
    `/workflow/processDefinition/processDefinitionImage/${processDefinitionId}` +
    '?Authorization=Bearer ' +
    getToken() +
    '&t' +
    Math.random()
  );
};

/**
 * 通过流程定义id获取xml
 * @param processDefinitionId 流程定义id
 * @returns
 */
export const processDefinitionXml = (processDefinitionId: string) => {
  return request({
    url: `/workflow/processDefinition/processDefinitionXml/${processDefinitionId}`,
    method: 'get'
  });
};

/**
 * 删除流程定义
 * @param processDefinitionId 流程定义id
 * @param deploymentId 部署id
 * @returns
 */
export const deleteProcessDefinition = (deploymentId: string, processDefinitionId: string) => {
  return request({
    url: `/workflow/processDefinition/${deploymentId}/${processDefinitionId}`,
    method: 'delete'
  });
};

/**
 * 挂起/激活
 * @param processDefinitionId 流程定义id
 * @returns
 */
export const updateProcessDefState = (processDefinitionId: string) => {
  return request({
    url: `/workflow/processDefinition/updateProcessDefState/${processDefinitionId}`,
    method: 'put'
  });
};

/**
 * 流程定义转换为模型
 * @param processDefinitionId 流程定义id
 * @returns
 */
export const convertToModel = (processDefinitionId: string) => {
  return request({
    url: `/workflow/processDefinition/convertToModel/${processDefinitionId}`,
    method: 'put'
  });
};

/**
 * 通过zip或xml部署流程定义
 * @returns
 */
export function deployProcessFile(data: any) {
  return request({
    url: '/workflow/processDefinition/deployByFile',
    method: 'post',
    data: data
  });
}

/**
 * 迁移流程
 * @param currentProcessDefinitionId
 * @param fromProcessDefinitionId
 * @returns
 */
export const migrationProcessDefinition = (currentProcessDefinitionId: string, fromProcessDefinitionId: string) => {
  return request({
    url: `/workflow/processDefinition/migrationProcessDefinition/${currentProcessDefinitionId}/${fromProcessDefinitionId}`,
    method: 'put'
  });
};
