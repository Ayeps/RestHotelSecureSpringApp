/* 
 * This is the client-side logic for connecting to RESTful Web Services on 
 * the server-side via the HotelRepository class.
 * 
 * This code is heavily dependent on JQuery 2.x. Despite this fact all client-
 * side code is language and server framework agnostic. Any server-side
 * framework that can deliver RESTful, non-HATEOUS style web services can be used.
 * 
 * References:
 * - Wikipedia: http://en.wikipedia.org/wiki/HATEOS
 */

// The root URL for the RESTful services
// NOTE: you MUST use https to make this secure! And the port number is
// specific to Glassfish developer mode. In production this would be 443
var rootURL = "https://localhost:8181/RestHotelSecureSpringApp/api/v1/hotels";
var currentHotel;

// Retrieve hotel list when application starts
findAll();

// Nothing to delete in initial application state
$('#btnDelete').hide();

// Register listeners
$('#btnSearch').click(function() {
    search($('#searchKey').val());
    return false;
});

// Trigger search when pressing 'Return' on search key input field
$('#searchKey').keypress(function(e) {
    if (e.which == 13) {
        search($('#searchKey').val());
        e.preventDefault();
        return false;
    }
});

$('#btnAdd').click(function() {
    newHotel();
    return false;
});

$('#btnSave').click(function() {
    if ($('#hotelId').val() == '')
        addHotel();
    else
        updateHotel();
    return false;
});

$('#btnDelete').click(function() {
    deleteHotel();
    return false;
});

$('#hotelList').on('click', "a", function() {
    findById($(this).data('identity'));
});

function search(searchKey) {
    if (searchKey == '')
        findAll();
    else
        findByName(searchKey);
}

function newHotel() {
    $('#btnDelete').hide();
    currentHotel = {};
    renderDetails(currentHotel); // Display empty form
}

function findAll() {
    console.log('findAll');
    $.ajax({
        type: 'GET',
        url: rootURL,
        dataType: 'json',
        success: renderList
    });
}

function renderList(data) {
    // JAX-RS serializes an empty list as null, and a 'collection of one' as an object (not an 'array of one')
    var list = data == null ? [] : (data instanceof Array ? data : [data]);

    $('#hotelList li').remove();
    $.each(list, function(index, obj) {
        $('#hotelList').append('<li><a href="#" data-identity="' + rootURL + '/' + obj.hotelId +'">' + obj.name + '</a></li>');
    });
}

function findByName(searchKey) {
    console.log('findByName: ' + searchKey);
    $.ajax({
        type: 'GET',
        url: rootURL + '/search/findByNameContaining?name=' + searchKey,
        dataType: "json",
        success: renderList
    });
}

function findById(self) {
    console.log(self);
    $.ajax({
        type: 'GET',
        url: self,
        dataType: "json",
        success: function(data, textstatus) {
            $('#btnDelete').show();
            console.log('findById success: ' + data.name);
            currentHotel = data;
            renderDetails(currentHotel);
        }
    });
}

function addHotel() {
    console.log(formToJSON());
    $.ajax({
        type: 'POST',
        contentType: 'application/json',
        url: rootURL,
        dataType: "json",
        data: formToJSON(),
        success: function(data, textStatus, jqXHR) {
            alert('Hotel created successfully');
            $('#btnDelete').show();
            //$('#hotelId').val(data.id);
            findAll();
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR.status);
            // Fix a bug in JQuery: 201 means the insert succeeded!
            if (jqXHR.status === 201 || jqXHR.status === 200) {
                alert('Hotel created successfully');
                $('#btnDelete').show();
                //$('#hotelId').val(data.id);
                findAll();
            }
            else {
                alert('addHotel error: ' + textStatus);
            }
        }
    });
}

function updateHotel() {
    console.log('updateHotel');
    $.ajax({
        type: 'PUT',
        contentType: 'application/json',
        url: rootURL + '/' + $('#hotelId').val(),
        dataType: "html",
        data: formToJSON(),
        success: function(data, textStatus, jqXHR) {
            alert('Hotel updated successfully');
            findAll();            
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert('updateHotel error: ' + textStatus);
        }
    });

}

function deleteHotel() {
    console.log('deleteHotel');
    $.ajax({
        type: 'DELETE',
        url: rootURL + '/' + $('#hotelId').val(),
        success: function(data, textStatus, jqXHR) {
            alert('Hotel deleted successfully');
            findAll();            
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert('deleteHotel error');
        }
    });
}

function renderDetails(hotel) {	
        if(hotel.name === undefined) {
            $('#hotelId').val(hotel.hotelId);
        } else {
            var id = hotel.hotelId;
            $('#hotelId').val(id);
        }
	$('#name').val(hotel.name);
	$('#address').val(hotel.address);
	$('#city').val(hotel.city);
	$('#zip').val(hotel.zip);
}

// Helper function to serialize all the form fields into a JSON string
function formToJSON() {
	return JSON.stringify({
		"address": $('#address').val(),
		"city": $('#city').val(),
		"name": $('#name').val(), 
		"zip": $('#zip').val(),
		});
}
