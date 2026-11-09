<template>
  <div 
    class="pagination" 
    v-if="props.data && props.data?.total_pages != 1"
  >
    <div class="card">
      <Paginator 
        :rows="Number(props.data.per_page)" 
        :totalRecords="props.data.total_items"
        :page="Number(props.data.current_page)"
        @page="onPageChange"
      />
    </div>
  </div>
</template>

<script setup>
  import Paginator from 'primevue/paginator';

  // Define emits
  const emit = defineEmits(['handlePagination']);

  // define api methods
  const {
    getMethod,
    getResult
  } = useApiMethods()

  // Define props
  const props = defineProps({
    data: Object,
    endPoint : String
  });

  // Handle changes in page number of pagination
  const onPageChange = (event) => {
    // console.log(event.page)
    getMethod(props.endPoint , event.page + 1 , true , false)
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });  
  };

  watchEffect(()=>{
    if(getResult?.value){
      emit('handlePagination' , getResult?.value?.data)
    }
  })
</script>

<style lang="scss" scoped>
  .pagination{
    direction: ltr;
  }
  .p-paginator{
    justify-content: flex-start;
  }
</style>


<!-- HOW TO USE THE COMPONENT -->

<!-- 
  <Pagination 
    :data="getResult?.data?.pagination"
    endPoint="endpoint that you need pagination works on it "
  />
-->