Vue.component('demo-grid', {
    template: 
    `<table>
        <thead>
        <tr>
            <th v-for="key in columns"
            @click="sortBy(key)"
            :class="{active: sortKey == key}">
            {{key | capitalize}}
            <span class="arrow"
                :class="sortOrders[key] > 0 ? 'asc' : 'dsc'">
            </span>
            </th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="
            entry in data
            | filterBy filterKey
            | orderBy sortKey sortOrders[sortKey]">
            <td v-for="key in columns">
            {{entry[key]}}
            </td>
        </tr>
        </tbody>
    </table>`,
    props: {
        data: Array,
        columns: Array,
        filterKey: String
    },
    data: function () {
        var sortOrders = {}
        this.columns.forEach(function (key) {
          sortOrders[key] = 1
        })
        return {
          sortKey: '',
          sortOrders: sortOrders
        }
    },
    methods: {
        sortBy: function (key) {
            this.sortKey = key
            this.sortOrders[key] = this.sortOrders[key] * -1
        }
    }
})


// function: from type id to type name
const house_type_const = {
    0: 'Classic Old Shabby Little',
    1: 'Chinese Style Large Flat',
    2: 'Super Luxury Villa'
}

let type_id_to_name = (type_id) => {
    return house_type_const[type_id]
}


var vm = new Vue({
    el: '#demo',
    data: {
        searchQuery: '',
        gridColumns: ['House Name', 'House Type'],
        gridData: [
            { 
                'House Name': 'Chuck Norris',
                'House Type': type_id_to_name(1) 
            },
            { 
                'House Name': 'Bruce Lee',
                'House Type': type_id_to_name(2)
            },
            { 
                'House Name': 'Jackie Chan',
                'House Type': type_id_to_name(0) 
            },
            { 
                'House Name': 'Jet Li', 
                'House Type': type_id_to_name(1) 
            }
        ]
    }
})