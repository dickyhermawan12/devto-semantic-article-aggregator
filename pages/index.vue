<template>
  <CBox v-bind="mainStyles[colorMode]" minH="100vh" class="container">
    <CBox d="flex" py="4" flex-dir="column" justify-content="center">
      <CFlex justify="center" direction="column" align="center">
        <CFlex w="40vw" justify="center" direction="column">
          <CFlex my="6" justify="space-evenly" align="center">
            <CIconButton mr="3" :icon="colorMode === 'light' ? 'moon' : 'sun'" :aria-label="`Switch to ${colorMode === 'light' ? 'dark' : 'light'
            } mode`" @click="toggleColorMode" />
            <CHeading as="span"> dev.to Article Aggregator </CHeading>
          </CFlex>
          <CFlex mb="3" justify="center" direction="row" align="center">
            <CInputGroup size="md" w="100%">
              <CInput type="text" placeholder="Reveal the obscurity..." v-model="articleFilters.search" />
              <CInputRightElement width="4.5rem">
                <CCloseButton h="1.75rem" size="sm" @click="() => (this.articleFilters.search = '')" />
              </CInputRightElement>
            </CInputGroup>
            <CButton variant-color="green" ml="3" @click="showArticles">Search</CButton>
          </CFlex>
          <CButton mb="4" variant-color="green" variant="outline" @click="showCollapse = !showCollapse">
            Advanced Options
          </CButton>
          <CCollapse :is-open="showCollapse">
            <CFormControl mb="2">
              <CFormLabel for="author">Author</CFormLabel>
              <CSelect id="author" placeholder="All author" v-model="articleFilters.author">
                <option v-for="author in authors" :key="author.id" :value="author.name">
                  {{ author.name }}
                </option>
              </CSelect>
            </CFormControl>
            <CFormControl mb="3">
              <CFormLabel for="tag">Tag</CFormLabel>
              <CFlex align="center">
                <CSelect id="tag" placeholder="Add a tag" v-model="tagSelected" style="flex-grow: 2">
                  <option v-for="tag in tags" :key="tag" :value="tag">
                    {{ tag }}
                  </option>
                </CSelect>
                <CButton variant-color="green" ml="2" px="40px"
                  @click="orderDate = orderDate === 'asc' ? 'desc' : 'asc'">Sort by {{ orderDate === 'asc' ? 'Oldest' :
                      'Newest'
                  }}</CButton>
              </CFlex>
            </CFormControl>
            <CStack :spacing="4" align-items="start" is-inline style="flex-wrap: wrap; row-gap: 10px">
              <CTag v-for="(tag, index) in articleFilters.tags" :key="tag" variant="solid"
                :variant-color="themeColors[tags.indexOf(tag) % 8]">
                <CTagLabel>{{ tag }}</CTagLabel>
                <CTagCloseButton @click.prevent="deleteTagSelection(index)" />
              </CTag>
            </CStack>
          </CCollapse>
        </CFlex>
        <CDivider my="4" />
      </CFlex>
      <CFlex justify="center">
        <CGrid maxW="70vw" template-columns="repeat(2, 1fr)" gap="2">
          <CBox v-for="article in articles" :key="article.id" w="100%" border-width="1px" rounded="lg" overflow="hidden">
            <CLink :href="article.url" is-external>
              <CImage v-if="article.image" :src="article.image" :alt="article.name" />
            </CLink>
            <CBox p="6">
              <CBox d="flex" align-items="baseline">
                <div v-for="tag in article.tags" :key="tag">
                  <CBadge rounded="full" px="2" mr="1" :variant-color="themeColors[tags.indexOf(tag) % 8]">
                    {{ tag }}
                  </CBadge>
                </div>
              </CBox>
              <CFlex justify="space-between">
                <CPopover placement="right" trigger="hover">
                  <CPopoverTrigger>
                    <CLink color="gray.500" font-weight="semibold" letter-spacing="wide" fontSize="sm" my="2">
                      {{ article.author }}
                    </CLink>
                  </CPopoverTrigger>
                  <CDarkMode>
                    <CPopoverContent border="0" zIndex="4" width="600px" color="white">
                      <CBox p="5">
                        <CFlex justify="space-around" align="center" py="2">
                          <CFlex align="center">
                            <CText fontWeight="bold">
                              {{ article.author }}
                            </CText>
                          </CFlex>
                          <CAvatar :name="article.author"
                            :src="authors.filter(author => author.name === article.author)[0].image" w="70px" h="70px" />
                        </CFlex>
                        <CDivider />
                        <CText mt="3" fontSize="sm"> Location: {{ authors.filter(author => author.name ===
                            article.author)[0].location
                        }} </CText>
                        <CText mt="2" fontSize="sm"> Joined On: {{ authors.filter(author => author.name ===
                            article.author)[0].joinedOn
                        }} </CText>
                        <CText mt="2" fontSize="sm"> Website: {{ authors.filter(author => author.name ===
                            article.author)[0].website
                        }} </CText>
                        <CText mt="2" fontSize="sm"> Education: {{ authors.filter(author => author.name ===
                            article.author)[0].education
                        }} </CText>
                        <CText mt="2" fontSize="sm"> Work: {{ authors.filter(author => author.name ===
                            article.author)[0].work
                        }} </CText>
                      </CBox>
                    </CPopoverContent>
                  </CDarkMode>
                </CPopover>
                <CText color="gray.500" font-weight="semibold" letter-spacing="wide" fontSize="sm" my="2">
                  ♥ {{ article.reactions }} | {{ article.datePosted }}
                </CText>
              </CFlex>
              <CBox mb="2" font-weight="semibold" as="h4" line-height="tight" is-truncated>
                <CLink :href="article.url" is-external>{{ article.name }}</CLink>
              </CBox>
              <CBox fontSize="sm">
                {{ article.description }}
              </CBox>
            </CBox>
          </CBox>
        </CGrid>
      </CFlex>
      <CModal :is-open="showModal">
        <CModalOverlay />
        <CModalContent>
          <CModalHeader>Are you sure?</CModalHeader>
          <CModalBody>Deleting user cannot be undone</CModalBody>
          <CModalFooter>
            <CButton @click="showModal = false"> Cancel </CButton>
            <CButton margin-left="3" variant-color="red" @click="showModal = false">
              Delete User
            </CButton>
          </CModalFooter>
          <CModalCloseButton @click="showModal = false" />
        </CModalContent>
      </CModal>
    </CBox>
  </CBox>
</template>

<script lang="js">

import ParsingClient from 'sparql-http-client/ParsingClient';
import { obtainTagsQuery, obtainAuthorQuery, obtainArticleQuery, endpointUrl } from "../utils/sparqlquery";

const client = new ParsingClient({ endpointUrl });

export default {
  name: 'IndexPage',
  components: {},
  inject: ['$chakraColorMode', '$toggleColorMode'],
  data() {
    return {
      showModal: false,
      showCollapse: false,
      mainStyles: {
        dark: {
          bg: 'gray.700',
          color: 'whiteAlpha.900'
        },
        light: {
          bg: 'white',
          color: 'gray.900'
        }
      },
      authors: [],
      authorFilters: {
        search: ''
      },
      articles: [],
      articleFilters: {
        search: '',
        author: '',
        tags: [],
      },
      articleOrderValues: [
        { attr: 'datePosted', mod: 'desc' }
      ],
      tags: [],
      tagSelected: '',
      orderDate: 'desc',
      themeColors: ['green', 'yellow', 'blue', 'cyan', 'orange', 'pink', 'indigo', 'red']
    }
  },
  watch: {
    tagSelected: function () {
      if (!this.articleFilters.tags.includes(this.tagSelected) && this.tagSelected !== "")
        this.articleFilters.tags.push(this.tagSelected);
    },
    orderDate: function () {
      const orderDateValue = this.articleOrderValues.find(x => x.attr == 'datePosted');
      if (orderDateValue)
        orderDateValue.mod = this.orderDate;
    }
  },
  computed: {
    colorMode() {
      return this.$chakraColorMode()
    },
    theme() {
      return this.$chakraTheme()
    },
    toggleColorMode() {
      return this.$toggleColorMode
    },
  },
  methods: {
    async showAuthorNames() {
      const query = obtainAuthorQuery();
      client.query.select(query).then((bindings) => {
        const arrayHashmapAuthors = bindings.reduce((obj, item) => {
          obj[item.id.value] = {};
          Object.entries(item).forEach(([key, value]) => {
            obj[item.id.value][key] = value.value;
          });
          return obj;
        }, {});

        this.authors = Object.values(arrayHashmapAuthors);
      });
    },
    async showArticles() {
      const query = obtainArticleQuery({ ...this.articleFilters }, this.articleOrderValues);
      console.log(query);
      client.query.select(query).then((bindings) => {
        const arrayHashmapArticles = bindings.reduce((obj, item) => {
          if (obj[item.id.value]) {
            obj[item.id.value].tags.push(item.tags.value);
          } else {
            obj[item.id.value] = { tags: [] };
            Object.entries(item).forEach(([key, value]) => {
              if (key !== 'tags') obj[item.id.value][key] = value.value;
              else obj[item.id.value].tags.push(item.tags.value);
            });
          }
          return obj;
        }, {});

        this.articles = Object.values(arrayHashmapArticles);
      });
    },
    deleteTagSelection: function (index) {
      this.$delete(this.articleFilters.tags, index);
    }
  },
  async created() {
    const authorQuery = obtainAuthorQuery();
    const tagsQuery = obtainTagsQuery();
    const authorBindings = await client.query.select(authorQuery);
    const tagsBindings = await client.query.select(tagsQuery);

    const arrayHashmapAuthors = authorBindings.reduce((obj, item) => {
      obj[item.id.value] = {};
      Object.entries(item).forEach(([key, value]) => {
        obj[item.id.value][key] = value.value;
      });
      return obj;
    }, {});

    tagsBindings.forEach((item) => {
      this.tags.push(item.tags.value);
    });

    this.authors = Object.values(arrayHashmapAuthors);
  }
}
</script>
