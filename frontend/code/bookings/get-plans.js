"use strict"



const getPlans = async () => {

    try {
        const response = await fetch('https://api.st.tsalmas.com/api/plans');
        const response_data = await response.json();
        return response_data;
    } catch (error) {
        return [];
    }

}










const create_plans_ui = (plans_list) => {

    let plans_collapse_string = '';



    let plans_counter = 0;
    for (const plan of plans_list) {
        plans_collapse_string += `
            <div class="plan-collapse-area mt-4" id="collapse_area+${plans_counter}">
    
                <a class="p-3 d-block plan-collapse-button-open rounded" role="button" aria-expanded="false"
                    aria-controls="plan_collapse_object_${plans_counter}" onclick="getBookingsPerPlan('${plan.plan_id}')"data-bs-toggle="modal" data-bs-target="#bookPlanCustomerModalAreaFormArea">
    
    
                    <div class="d-flex justify-content-between">
    
                        <div>
                            <h3>
                                ${plan.title},
                                <small class="text-muted">
                                    ${plan.category}
                                </small>
                            </h3>
    
                            <h5>${plan.small_description}</h5>


                            <p class="text-muted">
                                ${plan?.adults_only ? `
                                    <i class="fas fa-user-alt"></i>
                                    Πακέτο για Ενήλικες
                                ` : plan?.family_friendly ? `
                                    <i class="fas fa-user-check"></i>
                                    Πακέτο φιλικό προς τις οικογένειες
                                ` : ``}
                            </p>

                            <small class="text-muted">
                                ${plan.booking_type === 'direct' ? `
                                    <i class="fas fa-check-circle"></i>
                                    Direct booking
                                ` : `
                                    <i class="fas fa-calendar-alt"></i>
                                    On request
                                `}
                            </small>
                        </div>
    
    
                        <div class="text-end">
                            ${plan.price} € / άτομο
                            ${plan?.discount?.enabled ? `
                                (${plan.discount.value}
                                ${plan.discount.type === 'fixed' ? '€' : '%'} OFF)
                            ` : ``}

                            <div class="row mt-2">
                                <div class="col-12 text-muted text-end">
                                    έως ${plan.persons} άτομα
                                </div>
                            </div>

                        </div>
    
                    </div>
    
                </a>
    
            </div>
        `;


        plans_counter++;
    }



    return plans_collapse_string;

}





const plans_collapse_string = getPlans()
    .then((list) => create_plans_ui(list))
    .then((string) => document.getElementById('plans-list-area').innerHTML = string)
    .catch((error) => document.getElementById('plans-list-area').innerHTML = 'Προέκυψε κάποιο σφάλμα. Παρακαλώ δοκιμάστε ξανά αργότερα');









// get bookings per plan
const getBookingsPerPlan = async (plan_id) => {

    try {

        document.getElementById('plan-bookings-list').innerHTML = 'Φόρτωση κρατήσεων για το πακέτο...';

        const response = await fetch(`https://api.st.tsalmas.com/api/bookings/pl/${plan_id}`);
        const bookings_list = await response.json();

        document.getElementById('plan-bookings-list').innerHTML = createBookingsListUI(bookings_list);

    } catch (error) {
        toastr.error('Κάτι πήγε στραβά! Προσπαθήστε ξανά αργότερα!');
        return;
    }

}






const createBookingsListUI = (bookings_list) => {


    let ui_string = '';
    for (const booking of bookings_list)
        ui_string += `
            <tr>
                ${booking?.customer_id ? `
                    <td>${booking.main_customer.first_name} ${booking.main_customer.last_name}</td>
                    <td>${booking.main_customer.email}</td>
                    <td>${booking.main_customer.phone}</td>
                ` : ``}
                ${booking?.travel_agent_id ? `
                    <td>${booking.travel_agent.first_name} ${booking.travel_agent.last_name}</td>
                    <td>${booking.travel_agent.email}</td>
                    <td>${booking.travel_agent.phone}</td>
                ` : ``}
                ${booking?.secretary_id ? `
                    <td>${booking.secretary.first_name} ${booking.secretary.last_name}</td>
                    <td>${booking.secretary.email}</td>
                    <td>${booking.secretary.phone}</td>
                ` : ``}
                <td class="text-center">ΝΑΙ</td>
            </tr>
        `;



    if (ui_string !== '')
        ui_string = `
            <table class="table table-striped">
            
                <thead>
                    <tr>
                        <th class="text-center">Ονοματεπώνυμο</th>
                        <th class="text-center">Email</th>
                        <th class="text-center">Τηλέφωνο</th>
                        <th class="text-center">Πληρώθηκε</th>
                    </tr>
                </thead>

                <tbody>
                    ${ui_string}
                </tbody>

            </table>
        `;
    else
        ui_string = 'Δεν υπάρχουν κρατήσεις για το συγκεκριμένο πακέτο';




    return ui_string;


}


