import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { BusinessFormVO, BusinessFormForm, BusinessFormQuery } from '@/api/workflow/businessForm/types';

/**
 * 查询发起流程列表
 * @param query
 * @returns {*}
 */

export const listBusinessForm = (query?: BusinessFormQuery): AxiosPromise<BusinessFormVO[]> => {
  return request({
    url: '/workflow/businessForm/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询发起流程详细
 * @param id
 */
export const getBusinessForm = (id: string | number): AxiosPromise<BusinessFormVO> => {
  return request({
    url: '/workflow/businessForm/' + id,
    method: 'get'
  });
};

/**
 * 新增发起流程
 * @param data
 */
export const addBusinessForm = (data: BusinessFormForm) => {
  return request({
    url: '/workflow/businessForm',
    method: 'post',
    data: data
  });
};

/**
 * 修改发起流程
 * @param data
 */
export const updateBusinessForm = (data: BusinessFormForm) => {
  return request({
    url: '/workflow/businessForm',
    method: 'put',
    data: data
  });
};

/**
 * 删除发起流程
 * @param id
 */
export const delBusinessForm = (id: string | number | Array<string | number>) => {
  return request({
    url: '/workflow/businessForm/' + id,
    method: 'delete'
  });
};
