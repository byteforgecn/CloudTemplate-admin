import request from '@/utils/request';

/**
 * 查询模型列表
 * @param query
 * @returns {*}
 */
export const listModel = (query: object) => {
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
export const addModel = (data: object) => {
  return request({
    url: '/workflow/model/rest/models',
    method: 'post',
    data: data
  });
};

/**
 * 按id删除模型
 * @param {模型id} id
 * @returns {*}
 */
export function delModel(id: object) {
  return request({
    url: '/workflow/model/' + id,
    method: 'delete'
  });
}

/**
 * 模型部署
 * @param {模型id} id
 * @returns {*}
 */
export const modelDeploy = (id: string) => {
  return request({
    url: `/workflow/model/modelDeploy/${id}`,
    method: 'post'
  });
};
