import 'dotenv/config';
import { connectDatabase, Product, nextProductId } from '../server/db.js';
const products = [
['Flat White','Coffee','Double ristretto with silky steamed milk.',38,'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=900&auto=format&fit=crop&q=85','Barista favourite'],
['Cappuccino','Coffee','Rich espresso with a cloud of creamy microfoam.',36,'https://images.unsplash.com/photo-1534778101976-62847782c213?w=900&auto=format&fit=crop&q=85','Classic'],
['Iced Latte','Coffee','Chilled espresso, fresh milk and plenty of ice.',42,'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=900&auto=format&fit=crop&q=85','Refreshing'],
['Espresso','Coffee','A bold, syrupy single-origin shot.',28,'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=900&auto=format&fit=crop&q=85',null],
['Rooibos Chai','Tea','Lesotho-loved rooibos with warming spices and milk.',34,'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=900&auto=format&fit=crop&q=85',null],
['Earl Grey Tea','Tea','Black tea delicately scented with bergamot.',26,'https://images.unsplash.com/photo-1544787219-7f47-7?auto=format&fit=crop&w=900',null],
['Green Tea','Tea','A light, clean and soothing cup.',25,'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=900&auto=format&fit=crop&q=85',null],
['Masala Chai','Tea','Strong black tea simmered with fragrant spices.',32,'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=900&auto=format&fit=crop&q=85',null],
['Chocolate Milkshake','Milkshakes','Thick chocolate shake topped with whipped cream.',48,'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=900&auto=format&fit=crop&q=85','Popular'],
['Strawberry Milkshake','Milkshakes','Creamy strawberry goodness, blended fresh.',48,'https://images.unsplash.com/photo-1553787499-6f9133860278?w=900&auto=format&fit=crop&q=85',null],
['Vanilla Milkshake','Milkshakes','A smooth, timeless vanilla treat.',45,'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=900&auto=format&fit=crop&q=85',null],
['Oreo Milkshake','Milkshakes','Cookies, cream and a little indulgence.',52,'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=900&auto=format&fit=crop&q=85',null],
['Chocolate Chip Cookie','Cookies','Golden-baked cookie with generous chocolate chips.',22,'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=900&auto=format&fit=crop&q=85',null],
['Double Chocolate Cookie','Cookies','Rich cocoa cookie with a soft centre.',25,'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=900&auto=format&fit=crop&q=85',null],
['Oatmeal Cookie','Cookies','A comforting cookie with oats and a hint of cinnamon.',20,'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=900&auto=format&fit=crop&q=85',null],
['Butter Croissant','Snacks','Flaky, buttery layers baked until golden.',30,'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=900&auto=format&fit=crop&q=85','Fresh daily'],
['Blueberry Muffin','Snacks','Soft muffin bursting with blueberries.',32,'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=900&auto=format&fit=crop&q=85',null],
['Chicken Sandwich','Snacks','Toasted sandwich with chicken, greens and house sauce.',58,'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=900&auto=format&fit=crop&q=85',null],
['Cinnamon Roll','Snacks','Soft cinnamon swirl finished with a sweet glaze.',34,'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=900&auto=format&fit=crop&q=85',null],
['Cheese Toastie','Snacks','Melted cheese toasted between crisp sourdough slices.',55,'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=900&auto=format&fit=crop&q=85',null]
];
try {
 await connectDatabase();
 let added=0;
 for (const [name,category,description,price,image_url,tag] of products) {
   if (await Product.exists({name})) continue;
   await Product.create({id:await nextProductId(),name,category,description,price,image_url,tag,active:true}); added++;
 }
 console.log(`Added ${added} new menu products; existing products were preserved.`);
} finally { const mongoose=(await import('mongoose')).default; await mongoose.disconnect().catch(()=>{}); }
