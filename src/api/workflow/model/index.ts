import request from '@/utils/request';

/**
 * 查询模型列表
 * @param query
 * @returns {*}
 */
export const listModel = (query: Object) => {
  return request({
    url: '/workflow/model/list',
    method: 'get',
    params: query
  });
};

/**
 * 新增模型
 * @param query
 * @returns {*}
 */
export const addModel = (data: Object) => {
  return request({
    url: '/workflow/model/rest/models',
    method: 'post',
    data: data
  });
};

/**
 * 按id删除模型
 * @param {模型id} id
 * @returns
 */
export function delModel(id:Object) {
  return request({
    url: '/workflow/model/' + id,
    method: 'delete'
  })
}