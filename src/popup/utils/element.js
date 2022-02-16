/* eslint-disable no-multi-assign */
/*
 * @Author: Leo
 * @Date: 2021-12-08 14:13:04
 * @LastEditors: Leo
 * @LastEditTime: 2021-12-09 14:02:16
 * @Description: 按需导入element
 */
import 'bulma-fluent/bulma.sass'
import {
  Button,
  Input,
  Select,
  Tabs,
  TabPane,
  Badge,
  Table,
  TableColumn,
  FormItem,
  Form,
  Checkbox,
  CheckboxGroup,
  DatePicker,
  Radio,
  RadioGroup,
  Message
} from 'element-ui'
import 'element-ui/lib/theme-chalk/display.css'

import Vue from 'vue'

Input.props.size = {
  default: 'small',
  type: String
}
Select.props.size = {
  default: 'small',
  type: String
}
Button.props.size = {
  default: 'small',
  type: String
}

Vue.use(Input);
Vue.use(Select);
Vue.use(Button);
Vue.use(Tabs);
Vue.use(TabPane);
Vue.use(Badge);
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(FormItem);
Vue.use(Form);
Vue.use(Checkbox);
Vue.use(CheckboxGroup);
Vue.use(DatePicker);
Vue.use(Radio);
Vue.use(RadioGroup);
Vue.prototype.$message = Message
