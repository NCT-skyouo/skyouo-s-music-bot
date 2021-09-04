$('.dropdown-item').on('click', function () {
    var button = $(this).parent().parent().siblings('button');
    $(button).html($(this).text() + ' <i class="fas fa-caret-down"></i>');
    $(button).val($(this).text());
});

$("#search-form").on("submit", function (event) {
    event.preventDefault();
    window.location.href = `/search?type=${$('#search-type').text().trim()}&q=${$('#search-query').val()}`
});
