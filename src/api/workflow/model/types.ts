export interface ModelForm {
  name: string;
  key: string;
  categoryCode: string;
  description: string;
}

export interface ModelQuery extends PageQuery {
  name: string;
  key: string;
  categoryCode: string;
}
