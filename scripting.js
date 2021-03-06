$(document).ready(function() {

  var apiRoot = 'https://safe-mountain-67458.herokuapp.com/v1/dinner/';
  var datatableRowTemplate = $('[data-datatable-row-template]').children()[0];
  var dishesContainer = $('[data-dishes-container]');

  // init
  getAllDinnerIdeas();

  function createElement(data) {
    var element = $(datatableRowTemplate).clone();

    element.attr('data-dish-id', data.id);
    element.find('[data-dish-name-section] [data-dish-name-paragraph]').text(data.name);
    element.find('[data-dish-name-section] [data-dish-name-input]').val(data.name);

    element.find('[data-dish-description-section] [data-dish-description-paragraph]').text(data.description);
    element.find('[data-dish-description-section] [data-dish-description-input]').val(data.description);

    return element;
  }

  function handleDatatableRender(data) {
    dishesContainer.empty();
    data.forEach(function(dish) {
      createElement(dish).appendTo(dishesContainer);
    });
  }

  function getAllDishes() {
    var requestUrl = apiRoot + 'getDishes';

    $.ajax({
      url: requestUrl,
      method: 'GET',
      success: handleDatatableRender
    });
  }

  function handleDishUpdateRequest() {
    var parentEl = $(this).parent().parent();
    var dishId = parentEl.attr('data-dish-id');
    var dishName = parentEl.find('[data-dish-name-input]').val();
    var dishDescription = parentEl.find('[data-dish-description-input]').val();
    var requestUrl = apiRoot + 'updateDish';

    $.ajax({
      url: requestUrl,
      method: "PUT",
      processData: false,
      contentType: "application/json; charset=utf-8",
      dataType: 'json',
      data: JSON.stringify({
        id: dishId,
        name: dishName,
        description: dishDescription
      }),
      success: function(data) {
        parentEl.attr('data-dish-id', data.id).toggleClass('datatable__row--editing');
        parentEl.find('[data-dish-name-paragraph]').text(dishName);
        parentEl.find('[data-dish-description-paragraph]').text(dishDescription);
      }
    });
  }

  function handleDishDeleteRequest() {
    var parentEl = $(this).parent().parent();
    var taskId = parentEl.attr('data-dish-id');
    var requestUrl = apiRoot + 'deleteDish';

    $.ajax({
      url: requestUrl + '/?' + $.param({
        dishId: dishId
      }),
      method: 'DELETE',
      success: function() {
        parentEl.slideUp(400, function() { parentEl.remove(); });
      }
    })
  }

  function handleDishSubmitRequest(event) {
    event.preventDefault();

    var dishName = $(this).find('[name="name"]').val();
    var dishDescription = $(this).find('[name="description"]').val();

    var requestUrl = apiRoot + 'createDish';

    $.ajax({
      url: requestUrl,
      method: 'POST',
      processData: false,
      contentType: "application/json; charset=utf-8",
      dataType: 'json',
      data: JSON.stringify({
        name: dishName,
        description: dishDescription
      }),
      complete: function(data) {
        if(data.status === 200) {
          getAllDishes();
        }
      }
    });
  }

  function toggleEditingState() {
    var parentEl = $(this).parent().parent();
    parentEl.toggleClass('datatable__row--editing');

    var dishName = parentEl.find('[data-dish-name-paragraph]').text();
    var dishDescription = parentEl.find('[data-dish-description-paragraph]').text();

    parentEl.find('[data-dish-name-input]').val(dishName);
    parentEl.find('[data-dish-description-input]').val(dishDescription);
  }

  $('[data-dish-add-form]').on('submit', handleDishSubmitRequest);

  dishesContainer.on('click','[data-dish-edit-button]', toggleEditingState);
  dishesContainer.on('click','[data-dish-edit-abort-button]', toggleEditingState);
  dishesContainer.on('click','[data-dish-submit-update-button]', handleDishUpdateRequest);
  dishesContainer.on('click','[data-dish-delete-button]', handleDishDeleteRequest);
});