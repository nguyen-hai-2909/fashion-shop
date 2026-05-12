
const getAllInfo = async (req,res) => {
    const {name} = req.query;
    console.log("name",name);
    try {
        let info = {
            restaurant: [
                {
                    name: "Nhà hàng Long Hoa",
                    imgUrl: "https://media.dalatcity.org//Images/LDG/bongconganh/Nh%C3%A0%20h%C3%A0ng%20Ho%C3%A0ng%20Cung%20-%20L%C3%A0ng%20Osaka/cropper_636936212122300009.jpg",
                },
                {
                    name: "Nhà hàng Thái Nguyên",
                    imgUrl: "https://media.dalatcity.org//Images/LDG/bongconganh/Nh%C3%A0%20h%C3%A0ng%20Ho%C3%A0ng%20Cung%20-%20L%C3%A0ng%20Osaka/cropper_636936212122300009.jpg",
                },
                {
                    name: "Nhà hàng Hà Nội",
                    imgUrl: 'https://media.dalatcity.org//Images/LDG/bongconganh/Nh%C3%A0%20h%C3%A0ng%20Ho%C3%A0ng%20Cung%20-%20L%C3%A0ng%20Osaka/cropper_636936212122300009.jpg'
                }
            ],
            food: [
                {
                    name: "Thức ăn nhanh",
                    imgUrl: "https://media.dalatcity.org//Images/LDG/Import/1499670113510av_636591365332577260.jpg"
                },
                {
                    name: "Khoai tây",
                    imgUrl: "https://media.dalatcity.org//Images/LDG/Import/1499670113510av_636591365332577260.jpg"
                }
            ]
        }

        restaurantInfo = info.restaurant.filter(el => el?.name?.toLowerCase().indexOf(name.toLowerCase()) !== -1);
        foodInfo = info.food.filter(el => el?.name?.toLowerCase().indexOf(name.toLowerCase()) !== -1);

        info = {
            restaurant: [...restaurantInfo],
            food: [...foodInfo]
        }

        return res.status(200).json({message: "success", data: info})
    } catch (error) {
        return res.status(500).json(error);
    }
}

module.exports = {getAllInfo}