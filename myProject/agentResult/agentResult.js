/**
 * Created by jovi on 2016/12/15.
  */
  import Vue from 'vue';
  import hbcExt from '../../plugins/vue.ext';
  import MainView from './agentResult.vue';

  Vue.use(hbcExt);

  new Vue({
        el: '#app',
        render: h => h(MainView)
  });