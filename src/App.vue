<template>
  <div id="app">
    <div class="container">
      <div class="search-wrap">
        <v-search></v-search>
      </div>

      <div class="actions">
        <v-button @click="startAdd">添加</v-button>
        <v-button>导入</v-button>
        <v-button @click="startManage">管理</v-button>
      </div>

      <div class="content">
        <section class="section" v-for="(cat, i) of categories">
          <div class="s-head">
            <div class="h-title" @click="childrenIndex[i] = -1">{{cat.name}}</div>
            <div class="h-nav">
              <v-tab :titles="[
              { name: '未分类' },
              ...cat.children
              ]" v-model="childrenIndex[i]"></v-tab>
            </div>
          </div>
          <div class="s-body">
            <template v-if="childrenIndex[i] === 0">
              <div class="b-item" v-for="item of sites[cat.id]"><a class="link" target="_blank" :href="item.url">{{item.title}}</a></div>
            </template>
            <template v-else>
              <div class="b-item" v-for="item of sites[cat.children[childrenIndex[i] - 1].id]"><a class="link" target="_blank" :href="item.url">{{item.title}}</a></div>
            </template>
          </div>
        </section>
      </div>
    </div>

    <v-popup title="添加网址" v-model="isShowAddSite" :confirm="addSite">
      <div class="layout-form" slot="content">
        <div class="v-row">
          <label class="label">分类：</label>
          <v-select :source="categories" v-model="site.categoryId"></v-select>
        </div>

        <div class="v-row">
          <label class="label">标题：</label>
          <v-input v-model="site.title"></v-input>
        </div>

        <div class="v-row">
          <label class="label">网址：</label>
          <v-input v-model="site.url"></v-input>
        </div>

        <div class="v-row">
          <label class="label">标签：</label>
          <v-tag :tags="tags" v-model="site.tags"></v-tag>
        </div>
      </div>
    </v-popup>

    <v-popup title="管理分类与标签" v-model="isShowManager" fixed>
      <template slot="content">
        <v-tab :titles="tabs" v-model="managerTab"></v-tab>
        <div class="mgr-panel">
          <div class="mod-cat-tree">
            <div class="t-tip">右键点击操作</div>
            <div class="t-item" v-for="cat of categories">
              <div class="i-name" @click.right="showContextMenu($event, cat)"><v-icon icon="folder-flat"></v-icon>{{cat.name}}</div>
              <div class="i-children">
                <div class="c-item" v-for="child of cat.children">
                  <div class="i-name" @click.right="showContextMenu($event, child, cat.id)"><v-icon icon="folder-flat"></v-icon>{{child.name}}</div>
                </div>
              </div>
            </div>
            <div class="t-item">
              <div class="i-add" @click="startAddCategory"><v-icon icon="plus"></v-icon></div>
            </div>
          </div>
        </div>
      </template>
      <div slot="footer"></div>
    </v-popup>

    <div class="v-dropdown" :style="contextStyle" @click.stop v-if="isShowContext">
      <div class="d-item" @click="startAddChild" v-if="!parentId">新建子分类</div>
      <div class="d-item" @click="startEdit">重命名</div>
      <div class="d-item" @click="startDel">删除</div>
    </div>

    <v-popup :title="managerCategoryTitle" v-model="isShowManagerCategory" :confirm="manageCategory" fixed>
      <template slot="content">
        <v-input v-model="currentCategoryName"></v-input>
      </template>
    </v-popup>
  </div>
</template>

<script>
  import VTag from 'lovue/src/extension/Tag'
  import {makeTreeData} from './js/lib/tools'

  const prepared = {
    getCategories: gql`
query {
  categories {
    id
    name
    parentId
  }
}`,
    createCategory: gql`
mutation ($name: String!, $parentId: Int) {
  createCategory(name: $name, parentId: $parentId)
}`,
    updateCategory: gql`
mutation ($id: Int!, $name: String!) {
  updateCategory(id: $id, name: $name)
}`,
    createSite: gql`
mutation ($site: SiteInput) {
  createSite(site: $site)
}`,
    getSites: gql`
query {
  sites {
    id
    title
    description
    url
    categoryId
  }
}`
  }

  export default {
    name: 'app',
    data() {
      return {
        topCategories: [
          { name: '常用网址', value: 1 },
          { name: '实用查询', value: 2 },
          { name: '选择其他分类', value: 3 }
        ], /*
         categories: [
         { id: 1, name: '常用网址', value: 1 },
         { id: 2, name: '实用查询', value: 2 }
         ],*/
        categories: [],
        tags: [
          { name: '数字货币' },
          { name: '社区' },
          { name: '在线工具' },
          { name: '框架' },
          { name: '插件' }
        ],
        tabs: [{ name: '分类' }, { name: '标签' }],
        childrenIndex: [],
        isShowAddSite: false,
        isShowManager: false,
        isShowContext: false,
        isShowManagerCategory: false,
        managerCategoryTitle: '',
        currentCategoryName: '',
        manageCategoryType: '',
        site: {
          tags: []
        },
        sites: {},
        managerTab: 0,
        contextStyle: {
          top: 0,
          left: 0
        },
        parentId: undefined,
        selectedCategory: {}
      }
    },
    components: { VTag },
    methods: {
      async getCategories() {
        const body = await apolloClient.query({
          query: prepared.getCategories
        }).catch(this.error2)
        if (body === undefined) return

        this.categories = makeTreeData(body.data.categories)
        this.childrenIndex = this.categories.map(() => 0)
      },
      async getSites() {
        const body = await apolloClient.query({
          query: prepared.getSites
        }).catch(this.error2)
        if (body === undefined) return

        const sites = {}
        body.data.sites.forEach(site => {
          if (!sites[site.categoryId]) sites[site.categoryId] = []
          sites[site.categoryId].push(site)
        })
        this.sites = sites
      },
      startAdd() {
        this.site = { tags: [] }
        this.isShowAddSite = true
      },
      async addSite() {
        const { site } = this
        delete site.tags

        const body = await apolloClient.mutate({
          mutation: prepared.createSite,
          variables: { site }
        }).catch(this.error2)
        if (body === undefined) return

        this.success('添加成功')
        if (!this.sites[site.categoryId]) this.sites[site.categoryId] = []
        this.sites[site.categoryId].push({
          id: body,
          ...site
        })
        return true
      },
      startManage() {
        this.isShowManager = true
      },
      showContextMenu(ev, item, parentId) {
        ev.preventDefault()

        this.selectedCategory = item
        this.parentId = parentId
        this.contextStyle = {
          left: `${ev.clientX}px`,
          top: `${ev.clientY}px`
        }
        this.isShowContext = true
      },
      async manageCategory() {
        const { manageCategoryType, currentCategoryName } = this
        let body

        if (manageCategoryType === 'create') {
          const { categories } = this
          body = await apolloClient.mutate({
            mutation: prepared.createCategory,
            variables: { name: currentCategoryName }
          }).catch(this.error2)
          if (body === undefined) return

          this.success('增加成功')
          categories.push({
            id: body,
            name: currentCategoryName,
            children: []
          })
          return true
        }

        if (manageCategoryType === 'createChild') {
          const { selectedCategory } = this
          body = await apolloClient.mutate({
            mutation: prepared.createCategory,
            variables: {
              name: currentCategoryName,
              parentId: selectedCategory.id
            }
          }).catch(this.error2)
          if (body === undefined) return

          this.success('增加成功')
          selectedCategory.children.push({
            id: body,
            name: currentCategoryName,
            parentId: selectedCategory.id
          })
          return true
        }

        if (manageCategoryType === 'rename') {
          const { selectedCategory } = this
          body = await apolloClient.mutate({
            mutation: prepared.updateCategory,
            variables: {
              id: selectedCategory.id,
              name: currentCategoryName
            }
          }).catch(this.error2)
          if (body === undefined) return

          this.success('修改成功')
          selectedCategory.name = currentCategoryName
          return true
        }
      },
      startAddCategory() {
        this.managerCategoryTitle = '新增分类'
        this.currentCategoryName = ''
        this.manageCategoryType = 'create'
        this.isShowManagerCategory = true
      },
      startAddChild() {
        this.managerCategoryTitle = '新增子分类'
        this.currentCategoryName = ''
        this.manageCategoryType = 'createChild'
        this.isShowContext = false
        this.isShowManagerCategory = true
      },
      startEdit() {
        this.managerCategoryTitle = '重命名'
        this.currentCategoryName = this.selectedCategory.name
        this.manageCategoryType = 'rename'
        this.isShowContext = false
        this.isShowManagerCategory = true
      },
      startDel() {
        this.isShowContext = false
        const { categories, selectedCategory } = this
        this.$modal({
          content: '删除分类会同时删除其子分类，确定删除？',
          fixed: true,
          async: true,
          async confirm() {
            const body = await apolloClient.mutate({
              mutation: gql`mutation {
                deleteCategory(id: ${selectedCategory.id})
              }`
            }).catch(this.error)
            if (body === undefined) return

            this.success('删除成功')
            if (!selectedCategory.parentId) {
              categories.forEach((cat, i) => {
                cat.id === selectedCategory.id && categories.splice(i, 1)
              })
            } else {
              categories.forEach(cat => {
                if (cat.id === selectedCategory.parentId) {
                  cat.children.forEach((child, j) => {
                    child.id === selectedCategory.id && cat.children.splice(j, 1)
                  })
                }
              })
            }
            return true
          }
        })
      }
    },
    created() {
      this.getCategories()
      this.getSites()
    },
    mounted() {
      window.addEventListener('click', () => {
        this.isShowContext = false
      })
    }
  }
</script>
