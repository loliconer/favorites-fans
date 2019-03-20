<template>
  <div id="app">
    <div class="container">
      <div class="actions">
        <v-button @click="startAddSite">添加</v-button>
        <v-button>导入</v-button>
        <v-button @click="startManage">管理</v-button>
      </div>

      <div class="content">
        <section class="section" v-for="cat of categories">
          <div class="s-row">
            <div class="r-category">{{cat.name}}</div>
            <div class="r-sites">
              <div class="site-item" v-for="site of sites[cat.id]" @dblclick.self="openEditMode(site)">
                <a class="link" target="_blank" :href="site.url">{{site.title}}</a>
                <div class="i-actions" v-if="site.edit_">
                  <v-button size="sm" @click="startEditSite(site)">修改</v-button>
                  <v-button size="sm" type="danger" @click="deleteSite(site.id, site.categoryId)">删除</v-button>
                </div>
              </div>
            </div>
          </div>
          <div class="s-row" v-for="row of cat.children">
            <div class="r-category">{{row.name}}</div>
            <div class="r-sites">
              <div class="site-item" v-for="site of sites[row.id]" @dblclick.self="openEditMode(site)">
                <a class="link" target="_blank" :href="site.url">{{site.title}}</a>
                <div class="i-actions" v-if="site.edit_">
                  <v-button size="sm" @click="startEditSite(site)">修改</v-button>
                  <v-button size="sm" type="danger" @click="deleteSite(site.id, site.categoryId)">删除</v-button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <v-popup class="popup-site" :title="site.id ? '修改网址' : '添加网址'" v-model="isShowAddEditSite" :confirm="addEditSite">
      <div class="layout-form">
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

    <v-popup class="popup-manager" title="管理分类与标签" v-model="isShowManager" fixed no-footer>
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
    </v-popup>

    <div class="v-dropdown" :style="contextStyle" @click.stop v-if="isShowContext">
      <div class="d-item" @click="startAddChild" v-if="!parentId">新建子分类</div>
      <div class="d-item" @click="startEdit">重命名</div>
      <div class="d-item" @click="startDel">删除</div>
    </div>

    <v-popup :title="managerCategoryTitle" v-model="isShowManagerCategory" :confirm="manageCategory" fixed>
      <v-input v-model="currentCategoryName" focus></v-input>
    </v-popup>
  </div>
</template>

<script>
  import Tag from 'lovue/src/extension/Tag'
  import 'lovue/src/less/extension/Tag.less'
  import {makeTreeData} from './js/lib/tools'

  export default {
    name: 'app',
    data() {
      return {
        starter: 'vue',
        categories: [],
        tags: [
          { name: '数字货币' },
          { name: '社区' },
          { name: '在线工具' },
          { name: '框架' },
          { name: '插件' }
        ],
        tabs: [{ name: '分类' }, { name: '标签' }],
        isShowAddEditSite: false,
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
    components: {
      [Tag.name]: Tag
    },
    methods: {
      async getCategoriesAndSites() {
        const body = await apolloClient.query({
          query: gql`query {
            categories {
              id
              name
              parentId
            }
            sites {
              id
              title
              description
              url
              categoryId
            }
          }`
        }).catch(this.error2)
        if (body === undefined) return

        this.categories = makeTreeData(body.data.categories)

        const sites = {}
        body.data.sites.forEach(site => {
          if (!sites[site.categoryId]) sites[site.categoryId] = []
          sites[site.categoryId].push(site)
        })
        this.sites = sites
      },
      openEditMode(site) {
        this.$set(site, 'edit_', !site.edit_)
      },
      startAddSite() {
        this.site = { tags: [] }
        this.isShowAddEditSite = true
      },
      startEditSite(site) {
        this.site = Object.assign({}, site)
        this.isShowAddEditSite = true
      },
      async addEditSite() {
        if (sessionStorage.starter !== this.starter) return this.warn('无权限')
        const { site } = this
        delete site.tags

        if (site.id) {
          const body = await apolloClient.mutate({
            mutation: gql`mutation ($id: Int!, $site: SiteInput) {
              updateSite(id: $id, site: $site)
            }`,
            variables: {
              id: site.id,
              site: {
                title: site.title,
                url: site.url,
                categoryId: site.categoryId
              }
            }
          }).catch(this.error2)
          if (body === undefined) return

          if (body.data.updateSite === 0) {
            this.warn('修改的网址不存在')
            return true
          }

          this.success('修改成功')
          this.sites[site.categoryId].forEach((site_, i) => {
            if (site_.id === site.id) {
              this.sites[site.categoryId].splice(i, 1, Object.assign({}, site))
            }
          })
          return true
        } else {
          const body = await apolloClient.mutate({
            mutation: gql`mutation ($site: SiteInput) {
              createSite(site: $site)
            }`,
            variables: { site }
          }).catch(this.error2)
          if (body === undefined) return

          this.success('添加成功')
          if (!this.sites[site.categoryId]) this.sites[site.categoryId] = []
          this.sites[site.categoryId].push({
            id: body.data.createSite,
            ...site
          })
          return true
        }
      },
      deleteSite(id, categoryId) {
        if (sessionStorage.starter !== this.starter) return this.warn('无权限')
        const { sites } = this
        this.$modal({
          content: '确认删除该网址？',
          fixed: true,
          async confirm() {
            const body = await apolloClient.mutate({
              mutation: gql`mutation ($id: Int!) {
                deleteSite(id: $id)
              }`,
              variables: { id }
            }).catch(this.error2)
            if (body === undefined) return

            if (body.data.deleteSite === 0) {
              this.error('删除的网址不存在')
              return true
            }

            this.success('删除成功')
            sites[categoryId].forEach((site, i) => {
              site.id === id && sites[categoryId].splice(i, 1)
            })
            return true
          }
        })
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
        if (sessionStorage.starter !== this.starter) return this.warn('无权限')
        const { manageCategoryType, currentCategoryName } = this
        let body

        if (currentCategoryName === '') return this.error('名称不能为空')

        if (manageCategoryType === 'create') {
          const { categories } = this
          body = await apolloClient.mutate({
            mutation: gql`mutation ($category: CategoryInput) {
              createCategory(category: $category) {
                code
                success
                data
              }
            }`,
            variables: {
              category: {
                name: currentCategoryName
              }
            }
          }).catch(this.error2)
          if (body === undefined) return

          body = body.data.createCategory
          if (body.success) {
            this.success('增加成功')
            categories.push({
              id: body.data,
              name: currentCategoryName,
              value: body.data,
              children: []
            })
            return true
          }
        }

        if (manageCategoryType === 'createChild') {
          const { selectedCategory } = this
          body = await apolloClient.mutate({
            mutation: gql`mutation ($category: CategoryInput) {
              createCategory(category: $category) {
                code
                success
                data
              }
            }`,
            variables: {
              category: {
                name: currentCategoryName,
                parentId: selectedCategory.id
              }
            }
          }).catch(this.error2)
          if (body === undefined) return

          body = body.data.createCategory
          if (body.success) {
            this.success('增加成功')
            selectedCategory.children.push({
              id: body.data,
              name: currentCategoryName,
              value: body.data,
              parentId: selectedCategory.id
            })
            return true
          }
        }

        if (manageCategoryType === 'rename') {
          const { selectedCategory } = this
          body = await apolloClient.mutate({
            mutation: gql`mutation ($id: Int!, $category: CategoryInput) {
              updateCategory(id: $id, category: $category)
            }`,
            variables: {
              id: selectedCategory.id,
              category: {
                name: currentCategoryName
              }
            }
          }).catch(this.error2)
          if (body === undefined) return

          if (body.data.updateCategory === 0) {
            this.error('修改的分类不存在')
            return true
          }

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
        if (sessionStorage.starter !== this.starter) return this.warn('无权限')
        this.isShowContext = false
        const { categories, selectedCategory } = this
        this.$modal({
          content: '删除分类会同时删除其子分类，确定删除？',
          fixed: true,
          async confirm() {
            const body = await apolloClient.mutate({
              mutation: gql`mutation ($id: Int!) {
                deleteCategory(id: $id)
              }`,
              variables: {
                id: selectedCategory.id
              }
            }).catch(this.error2)
            if (body === undefined) return

            if (body.data.deleteCategory === 0) {
              this.error('删除的分类不存在')
              return true
            }

            this.success('删除成功')
            if (!selectedCategory.parentId) {
              categories.forEach((cat, i) => {
                cat.id === selectedCategory.id && categories.splice(i, 1)
              })
              return true
            }

            categories.forEach(cat => {
              if (cat.id !== selectedCategory.parentId) return
              cat.children.forEach((child, j) => {
                child.id === selectedCategory.id && cat.children.splice(j, 1)
              })
            })
            return true
          }
        })
      }
    },
    created() {
      this.getCategoriesAndSites()
    },
    mounted() {
      window.addEventListener('click', () => {
        this.isShowContext = false
      })
    }
  }
</script>
