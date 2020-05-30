<template>
  <div id="app">
    <div class="container">
      <div class="logo">
        <img src="/img/logo.png">
      </div>
      <div class="actions">
        <v-button @click="startAddSite">添加</v-button>
        <!--<v-button>导入</v-button>-->
        <v-button @click="startManage">管理</v-button>
      </div>

      <div class="content">
        <section class="section" v-for="cat of categories">
          <div class="s-row">
            <div class="r-category">{{cat.name}}</div>
            <div class="r-sites" @dragenter="dragenterHandler($event, cat.id)" @dragstart="dragstartHandler($event, cat.id)" @drop="dropHandler($event, cat.id)" @dragover="dragoverHandler">
              <transition-group name="site-item" tag="div" class="site-items">
                <div class="site-item" v-for="(site, i) of sites[cat.id]" :key="site.id" @dblclick.self="openEditMode(site)" draggable="true" :data-index="i">
                  <a class="link" target="_blank" :href="site.url">{{site.title}}</a>
                  <div class="i-actions" v-if="site.edit_">
                    <v-button size="sm" @click="startEditSite(site)">修改</v-button>
                    <v-button size="sm" type="danger" @click="deleteSite(site.id, site.categoryId)">删除</v-button>
                  </div>
                </div>
                <div class="site-item add-site-icon" key="add-site-icon" @click="startAddSite(cat.id)"><v-icon icon="plus"></v-icon></div>
              </transition-group>
            </div>
          </div>
          <div class="s-row" v-for="row of cat.children">
            <div class="r-category">{{row.name}}</div>
            <div class="r-sites" @dragenter="dragenterHandler($event, row.id)" @dragstart="dragstartHandler($event, row.id)" @drop="dropHandler($event, row.id)" @dragover="dragoverHandler">
              <transition-group name="site-item" tag="div" class="site-items">
                <div class="site-item" v-for="(site, i) of sites[row.id]" :key="site.id" @dblclick.self="openEditMode(site)" draggable="true" :data-index="i">
                  <a class="link" target="_blank" :href="site.url">{{site.title}}</a>
                  <div class="i-actions" v-if="site.edit_">
                    <v-button size="sm" @click="startEditSite(site)">修改</v-button>
                    <v-button size="sm" type="danger" @click="deleteSite(site.id, site.categoryId)">删除</v-button>
                  </div>
                </div>
                <div class="site-item add-site-icon" key="add-site-icon" @click="startAddSite(row.id)"><v-icon icon="plus"></v-icon></div>
              </transition-group>
            </div>
          </div>
        </section>
      </div>
    </div>

    <v-popup class="popup-site" :title="site.id ? '修改网址' : '添加网址'" v-model="isShowAddEditSite" :confirm="addEditSite">
      <div class="layout-form">
        <v-row>
          <label class="label">分类：</label>
          <v-select :source="categories" v-model="site.categoryId"></v-select>
        </v-row>

        <v-row>
          <label class="label">标题：</label>
          <v-input v-model="site.title"></v-input>
        </v-row>

        <v-row>
          <label class="label">网址：</label>
          <v-input v-model="site.url"></v-input>
        </v-row>

        <!--<v-row>
          <label class="label">标签：</label>
          <v-tag :tags="tags" v-model="site.tags"></v-tag>
        </v-row>-->
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
        selectedCategory: {},
        draggingCategoryId: 0,
        draggingSiteIndex: 0,
        prevDraggingElem: null
      }
    },
    components: {
      [Tag.name]: Tag
    },
    methods: {
      async getCategoriesAndSites() {
        const body = await Promise.all([
          $fetch.get('categories'),
          $fetch.get('sites')
        ]).catch(this.error)
        if (body === undefined) return

        this.categories = makeTreeData(body[0])
        const sites = {}
        body[1].forEach(site => {
          if (!sites[site.categoryId]) sites[site.categoryId] = []
          sites[site.categoryId].push(site)
        })
        this.sites = this.sortSites(sites)
      },
      sortSites(sites) {
        for (let key in sites) {
          sites[key] = sites[key].sort((a, b) => {
            if (a.serialNo === null || b.serialNo === null) return -1
            return a.serialNo - b.serialNo
          })
        }
        return sites
      },
      openEditMode(site) {
        this.$set(site, 'edit_', !site.edit_)
      },
      startAddSite(categoryId) {
        this.site = { categoryId, tags: [] }
        this.isShowAddEditSite = true
      },
      startEditSite(site) {
        this.site = Object.assign({}, site)
        this.isShowAddEditSite = true
      },
      async addEditSite() {
        const { sites } = this
        const site = Object.assign({}, this.site)
        const id = site.id
        delete site.tags

        if (!id) {
          if (!sites[site.categoryId]) sites[site.categoryId] = []
          site.serialNo = sites[site.categoryId].length
        }

        const url = id ? `sites/${id}` : 'sites'
        const method = id ? 'put' : 'post'
        const body = await $fetch[method](url, site).catch(this.error)
        if (body === undefined) return

        if (id) {
          this.success('修改成功')
          this.sites[site.categoryId].forEach((site_, i) => {
            if (site_.id === id) {
              this.sites[site.categoryId].splice(i, 1, Object.assign({}, site))
            }
          })
        } else {
          this.success('添加成功')
          if (!this.sites[site.categoryId]) this.sites[site.categoryId] = []
          this.sites[site.categoryId].push(body)
        }
        return true
      },
      deleteSite(id, categoryId) {
        const { sites } = this
        this.modal({
          content: '确认删除该网址？',
          fixed: true,
          async confirm() {
            const body = await $fetch.delete(`sites/${id}`, {}).catch(this.error)
            if (body === undefined) return

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
        const { manageCategoryType, currentCategoryName, sites } = this

        if (currentCategoryName === '') return this.error('名称不能为空')

        let body
        if (manageCategoryType === 'create') {
          const { categories } = this
          body = await $fetch.post('categories', {
            name: currentCategoryName
          }).catch(this.error)
          if (body === undefined) return

          this.success('增加成功')
          body.value = body.id
          body.children = []
          categories.push(body)
          sites[body.id] = []
        }

        if (manageCategoryType === 'createChild') {
          const { selectedCategory } = this
          body = await $fetch.post('categories', {
            name: currentCategoryName,
            parentId: selectedCategory.id
          }).catch(this.error)
          if (body === undefined) return

          this.success('增加成功')
          body.value = body.id
          sites[body.id] = []
          selectedCategory.children.push(body)
        }

        if (manageCategoryType === 'rename') {
          const { selectedCategory } = this
          body = await $fetch.put(`categories/${selectedCategory.id}`, {
            name: currentCategoryName
          }).catch(this.error)
          if (body === undefined) return

          this.success('修改成功')
          selectedCategory.name = currentCategoryName
        }

        return true
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
        this.modal({
          content: '删除分类会同时删除其子分类，确定删除？',
          fixed: true,
          async confirm() {
            const body = await $fetch.delete(`categories/${selectedCategory.id}`).catch(this.error)
            if (body === undefined) return

            this.success('删除成功')
            if (!selectedCategory.parentId) {
              categories.forEach((cat, i) => {
                cat.id === selectedCategory.id && categories.splice(i, 1)
              })
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
      },
      dragstartHandler(ev, categoryId) {
        this.draggingCategoryId = categoryId
        for (let elem of ev.path) {
          if (elem.classList.contains('site-item')) {
            this.draggingSiteIndex = +elem.dataset.index
            break
          }
          if (elem.classList.contains('r-sites')) break
        }
      },
      dragenterHandler(ev, categoryId) {
        if (this.draggingCategoryId !== categoryId) return
        if (this.prevDraggingElem) this.prevDraggingElem.style.borderLeft = '1px solid var(--border-color)'

        for (let elem of ev.path) {
          if (elem.classList.contains('add-site-icon')) break
          if (elem.classList.contains('r-sites')) break

          if (elem.classList.contains('site-item')) {
            elem.style.borderLeft = '4px solid var(--blue-color)'
            this.prevDraggingElem = elem
            break
          }
        }
      },
      dropHandler(ev, categoryId) {
        const { draggingSiteIndex, draggingCategoryId, sites } = this
        if (draggingCategoryId !== categoryId) return

        const sitesList = sites[draggingCategoryId]
        const backupList = sitesList.slice()
        let startUpdateIndex
        for (let elem of ev.path) {
          if (elem.classList.contains('add-site-icon')) break
          if (elem.classList.contains('r-sites')) break

          if (elem.classList.contains('site-item')) {
            elem.style.borderLeft = '1px solid var(--border-color)'
            this.prevDraggingElem = null

            const enterSiteIndex = +elem.dataset.index
            const draggingSite = sitesList[draggingSiteIndex]

            if (draggingSiteIndex === enterSiteIndex) return

            sitesList.splice(draggingSiteIndex, 1)
            if (draggingSiteIndex > enterSiteIndex) { // 向左移动
              sitesList.splice(enterSiteIndex, 0, draggingSite)
              startUpdateIndex = enterSiteIndex
            } else { // 向右移动
              sitesList.splice(enterSiteIndex - 1, 0, draggingSite)
              startUpdateIndex = draggingSiteIndex
            }
            break
          }
        }

        this.updateSites(sitesList, startUpdateIndex, draggingCategoryId, backupList)
      },
      dragoverHandler(ev) {
        ev.preventDefault()
      },
      async updateSites(sites, startUpdateIndex, categoryId, backupList) {
        const updatingSites = []
        sites.forEach((site, index) => {
          if (index < startUpdateIndex) return
          updatingSites.push({
            id: site.id,
            serialNo: index
          })
        })
        const body = await $fetch.put('sites-order', {
          sites: updatingSites
        }).catch(this.error)
        if (body === undefined) {
          this.sites[categoryId] = backupList
        }
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
