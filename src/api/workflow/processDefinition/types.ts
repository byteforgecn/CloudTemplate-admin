export interface processDefinitionForm {
  businessKey: string;
  processKey: string;
}
export interface processDefinitionQuery extends PageQuery {
  name: string;
  key: string;
}