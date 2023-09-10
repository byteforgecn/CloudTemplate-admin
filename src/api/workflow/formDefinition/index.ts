import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { FormDefinitionVO, FormDefinitionForm, FormDefinitionQuery } from '@/api/workflow/formDefinition/types';

/**
 * 查询动态单与流程定义关联信息列表
 * @param query
 * @returns {*}
 */

export const listFormDefinition = (query?: FormDefinitionQuery): AxiosPromise<FormDefinitionVO[]> => {
  return request({
    url: '/workflow/formDefinition/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询动态单与流程定义关联信息详细
 * @param id
 */
export const getFormDefinition = (id: string | number): AxiosPromise<FormDefinitionVO> => {
  return request({
    url: '/workflow/formDefinition/' + id,
    method: 'get'
  });
};

/**
 * 新增动态单与流程定义关联信息
 * @param data
 */
export const addFormDefinition = (data: FormDefinitionForm) => {
  return request({
    url: '/workflow/formDefinition',
    method: 'post',
    data: data
  });
};

/**
 * 修改动态单与流程定义关联信息
 * @param data
 */
export const updateFormDefinition = (data: FormDefinitionForm) => {
  return request({
    url: '/workflow/formDefinition',
    method: 'put',
    data: data
  });
};

/**
 * 删除动态单与流程定义关联信息
 * @param id
 */
export const delFormDefinition = (id: string | number | Array<string | number>) => {
  return request({
    url: '/workflow/formDefinition/' + id,
    method: 'delete'
  });
};
