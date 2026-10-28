// 客户类别
export const customerCategories = [
  { id: 1, name: '普通客户', discount: 1.0, description: '标准价格' },
  { id: 2, name: '会员客户', discount: 0.9, description: '享 9 折优惠' },
  { id: 3, name: 'VIP客户', discount: 0.8, description: '享 8 折优先派单' }
]

// 服务类别
export const serviceCategories = [
  { id: 1, name: '日常保洁', unit: '元/小时', price: 40, description: '家庭日常清洁' },
  { id: 2, name: '深度保洁', unit: '元/次', price: 380, description: '全屋深度清洁消毒' },
  { id: 3, name: '月嫂服务', unit: '元/月', price: 12800, description: '26天专业月嫂' },
  { id: 4, name: '育儿嫂', unit: '元/月', price: 7800, description: '婴幼儿照看' },
  { id: 5, name: '养老护理', unit: '元/月', price: 6800, description: '老年人看护陪伴' },
  { id: 6, name: '家电维修', unit: '元/次', price: 80, description: '常见家电故障维修' },
  { id: 7, name: '管道疏通', unit: '元/次', price: 150, description: '下水管道疏通' }
]

// 客户数据
export const customers = [
  { id: 'C20240001', name: '张伟', gender: '男', categoryId: 2, address: '北京市朝阳区阳光路88号3号楼', phone: '13800138001', registerDate: '2024-01-15', operator: 'admin', orderCount: 8, totalConsume: 12800 },
  { id: 'C20240002', name: '李娜', gender: '女', categoryId: 3, address: '上海市浦东新区陆家嘴环路1000号', phone: '13900139002', registerDate: '2024-02-20', operator: 'admin', orderCount: 15, totalConsume: 45600 },
  { id: 'C20240003', name: '王芳', gender: '女', categoryId: 1, address: '广州市天河区体育西路50号', phone: '13700137003', registerDate: '2024-03-10', operator: 'staff1', orderCount: 3, totalConsume: 1200 },
  { id: 'C20240004', name: '刘强', gender: '男', categoryId: 2, address: '深圳市南山区科技园南区', phone: '13600136004', registerDate: '2024-04-05', operator: 'staff1', orderCount: 6, totalConsume: 9600 },
  { id: 'C20240005', name: '陈静', gender: '女', categoryId: 1, address: '成都市武侯区天府大道999号', phone: '13500135005', registerDate: '2024-05-18', operator: 'staff2', orderCount: 2, totalConsume: 760 },
  { id: 'C20240006', name: '赵磊', gender: '男', categoryId: 3, address: '杭州市西湖区文三路200号', phone: '13400134006', registerDate: '2024-06-22', operator: 'admin', orderCount: 22, totalConsume: 68900 },
  { id: 'C20240007', name: '周婷', gender: '女', categoryId: 2, address: '武汉市洪山区珞瑜路1037号', phone: '13300133007', registerDate: '2024-07-30', operator: 'staff1', orderCount: 5, totalConsume: 8200 },
  { id: 'C20240008', name: '孙浩', gender: '男', categoryId: 1, address: '南京市鼓楼区中山北路200号', phone: '13200132008', registerDate: '2024-08-12', operator: 'staff2', orderCount: 1, totalConsume: 400 }
]

// 服务员状态：0-空闲，1-已排班，2-服务中，3-休假
export const workers = [
  { id: 'W20240101', name: '张阿姨', gender: '女', serviceCategoryId: 1, healthCertNo: 'HC2024001234', certLevel: '中级', phone: '15800158001', registerDate: '2024-01-10', operator: 'admin', rating: 4.8, status: 0 },
  { id: 'W20240102', name: '李阿姨', gender: '女', serviceCategoryId: 3, healthCertNo: 'HC2024002345', certLevel: '高级', phone: '15900159002', registerDate: '2024-02-15', operator: 'admin', rating: 4.9, status: 1 },
  { id: 'W20240103', name: '王阿姨', gender: '女', serviceCategoryId: 4, healthCertNo: 'HC2024003456', certLevel: '中级', phone: '15700157003', registerDate: '2024-03-08', operator: 'staff1', rating: 4.6, status: 2 },
  { id: 'W20240104', name: '赵阿姨', gender: '女', serviceCategoryId: 5, healthCertNo: 'HC2024004567', certLevel: '高级', phone: '15600156004', registerDate: '2024-04-20', operator: 'staff1', rating: 4.7, status: 0 },
  { id: 'W20240105', name: '刘师傅', gender: '男', serviceCategoryId: 6, healthCertNo: 'HC2024005678', certLevel: '中级', phone: '15500155005', registerDate: '2024-05-12', operator: 'staff2', rating: 4.5, status: 0 },
  { id: 'W20240106', name: '陈阿姨', gender: '女', serviceCategoryId: 2, healthCertNo: 'HC2024006789', certLevel: '初级', phone: '15400154006', registerDate: '2024-06-05', operator: 'admin', rating: 4.3, status: 3 },
  { id: 'W20240107', name: '周师傅', gender: '男', serviceCategoryId: 7, healthCertNo: 'HC2024007890', certLevel: '中级', phone: '15300153007', registerDate: '2024-07-18', operator: 'staff2', rating: 4.4, status: 0 },
  { id: 'W20240108', name: '黄阿姨', gender: '女', serviceCategoryId: 1, healthCertNo: 'HC2024008901', certLevel: '中级', phone: '15200152008', registerDate: '2024-08-22', operator: 'staff1', rating: 4.7, status: 1 }
]

// 订单状态：0-待派单，1-已派单(待上门)，2-服务中，3-已完成，4-已取消
export const orders = [
  { id: 'O20241000001', customerId: 'C20240001', workerId: 'W20240101', categoryId: 1, appointDate: '2024-10-25', expectTime: '09:00', address: '北京市朝阳区阳光路88号3号楼', duration: 4, estimatedAmount: 144, actualAmount: 144, status: 3, operator: 'admin', createTime: '2024-10-24 14:30' },
  { id: 'O20241000002', customerId: 'C20240002', workerId: 'W20240102', categoryId: 3, appointDate: '2024-10-20', expectTime: '08:00', address: '上海市浦东新区陆家嘴环路1000号', duration: 26, estimatedAmount: 10240, actualAmount: 10240, status: 3, operator: 'admin', createTime: '2024-10-15 10:00' },
  { id: 'O20241000003', customerId: 'C20240004', workerId: 'W20240101', categoryId: 1, appointDate: '2024-10-28', expectTime: '14:00', address: '深圳市南山区科技园南区', duration: 3, estimatedAmount: 108, actualAmount: null, status: 1, operator: 'staff1', createTime: '2024-10-27 09:15' },
  { id: 'O20241000004', customerId: 'C20240006', workerId: 'W20240103', categoryId: 4, appointDate: '2024-10-26', expectTime: '07:30', address: '杭州市西湖区文三路200号', duration: 1, estimatedAmount: 6240, actualAmount: null, status: 2, operator: 'admin', createTime: '2024-10-20 16:45' },
  { id: 'O20241000005', customerId: 'C20240003', workerId: null, categoryId: 1, appointDate: '2024-10-30', expectTime: '10:00', address: '广州市天河区体育西路50号', duration: 2, estimatedAmount: 80, actualAmount: null, status: 0, operator: 'staff1', createTime: '2024-10-27 11:20' },
  { id: 'O20241000006', customerId: 'C20240007', workerId: 'W20240105', categoryId: 6, appointDate: '2024-10-29', expectTime: '15:00', address: '武汉市洪山区珞瑜路1037号', duration: 1, estimatedAmount: 72, actualAmount: null, status: 1, operator: 'staff2', createTime: '2024-10-28 08:30' },
  { id: 'O20241000007', customerId: 'C20240005', workerId: 'W20240107', categoryId: 7, appointDate: '2024-10-22', expectTime: '13:00', address: '成都市武侯区天府大道999号', duration: 1, estimatedAmount: 150, actualAmount: 150, status: 3, operator: 'staff2', createTime: '2024-10-21 09:00' },
  { id: 'O20241000008', customerId: 'C20240008', workerId: null, categoryId: 2, appointDate: '2024-10-18', expectTime: '09:00', address: '南京市鼓楼区中山北路200号', duration: 1, estimatedAmount: 380, actualAmount: null, status: 4, operator: 'staff1', createTime: '2024-10-16 14:00' }
]

// 评价
export const reviews = [
  { id: 1, orderId: 'O20241000001', stars: 5, content: '阿姨打扫得非常干净，态度也好，下次还找她！', createTime: '2024-10-25 18:00', hasComplaint: false, complaintContent: '', complaintStatus: '', complaintResult: '' },
  { id: 2, orderId: 'O20241000002', stars: 5, content: '月嫂经验丰富，对宝宝很有耐心。', createTime: '2024-10-20 20:00', hasComplaint: false, complaintContent: '', complaintStatus: '', complaintResult: '' },
  { id: 3, orderId: 'O20241000007', stars: 4, content: '疏通速度快，就是价格有点小贵。', createTime: '2024-10-22 15:30', hasComplaint: false, complaintContent: '', complaintStatus: '', complaintResult: '' }
]

// 用户（系统用户）
export const sysUsers = [
  { id: 1, username: 'admin', password: '123456', name: '系统管理员', roleId: 1, phone: '13800000000' },
  { id: 2, username: 'staff1', password: '123456', name: '张调度', roleId: 2, phone: '13800000001' },
  { id: 3, username: 'staff2', password: '123456', name: '李前台', roleId: 2, phone: '13800000002' }
]

export const roles = [
  { id: 1, name: '系统管理员', description: '全部权限' },
  { id: 2, name: '家政管理员', description: '客户/服务员/订单/评价管理' }
]

export const orderStatusMap = {
  0: { label: '待派单', color: 'warning' },
  1: { label: '已派单', color: '' },
  2: { label: '服务中', color: 'primary' },
  3: { label: '已完成', color: 'success' },
  4: { label: '已取消', color: 'info' }
}

export const workerStatusMap = {
  0: { label: '空闲', color: 'success' },
  1: { label: '已排班', color: 'warning' },
  2: { label: '服务中', color: 'primary' },
  3: { label: '休假', color: 'info' }
}
