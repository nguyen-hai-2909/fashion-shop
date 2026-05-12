/* eslint-disable react/prop-types */
import { useCallback, useContext, useMemo, useState } from "react";
import {
  BarChartOutlined,
  AppstoreOutlined,
  DashboardOutlined,
  GiftOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  TeamOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import {
  Layout,
  Menu,
  Button,
  ConfigProvider,
  Dropdown,
  Modal,
  Space,
  Tag,
  Typography,
} from "antd";
const { Header, Sider, Content } = Layout;
import { useNavigate, useLocation } from "react-router-dom";
import { adminContext } from "../context/AdminContext";
import { adminMenuEntries, canAccessAdminPage } from "../utils/adminPermission";

const LayoutAdmin = ({ children }) => {
  const UNSAVED_KEY = "admin-unsaved-changes";
  const navigate = useNavigate();
  const requestNavigate = useCallback(
    (path) => {
      const hasUnsaved = sessionStorage.getItem(UNSAVED_KEY) === "1";
      if (!hasUnsaved) {
        navigate(path, { replace: true });
        return;
      }
      Modal.confirm({
        title: "Discard unsaved changes?",
        content: "You have unsaved changes. Leave this page and discard them?",
        okText: "Discard",
        cancelText: "Stay",
        onOk: () => {
          sessionStorage.removeItem(UNSAVED_KEY);
          navigate(path, { replace: true });
        },
      });
    },
    [navigate]
  );

  const location = useLocation();
  const { admin, dispatch } = useContext(adminContext);
  const [collapsed, setCollapsed] = useState(false);

  const selectedKey = useMemo(() => {
    const seg = location.pathname.split("/")[2] || "dashboard";
    if (seg === "product" && location.pathname.includes("/product/create")) return "product";
    return seg;
  }, [location.pathname]);

  const displayName =
    admin?.name || admin?.fullName || admin?.email || "Administrator";
  const roleLabel =
    admin?.role === "manager"
      ? "Manager"
      : admin?.role === "staff"
        ? "Staff"
        : "Administrator";

  const handleLogout = useCallback(() => {
    dispatch({ type: "LOG_OUT" });
  }, [dispatch]);

  const iconByKey = {
    dashboard: <DashboardOutlined />,
    analytic: <BarChartOutlined />,
    product: <ShoppingOutlined />,
    order: <ShoppingCartOutlined />,
    user: <TeamOutlined />,
    category: <AppstoreOutlined />,
    reviews: <CommentOutlined />,
    discount: <GiftOutlined />,
  };
  const menuItems = useMemo(
    () =>
      adminMenuEntries
        .filter((m) => canAccessAdminPage(admin?.role, m.key))
        .map((m) => ({
          key: m.key,
          icon: iconByKey[m.key],
          label: m.label,
          onClick: () => requestNavigate(`/admin/${m.key}`),
        })),
    [requestNavigate, admin?.role]
  );

  const dropdownItems = [
    {
      key: "logout",
      label: (
        <span onClick={handleLogout}>
          Log out <LogoutOutlined />
        </span>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#722f37",
          colorBgContainer: "#faf8f6",
          borderRadius: 8,
        },
      }}
    >
      <Layout style={{ minHeight: "100vh" }}>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={240}
          style={{
            background: "#1a1520",
            borderRight: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              padding: collapsed ? "16px 12px" : "20px 20px 12px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Typography.Title
              level={5}
              style={{
                color: "#f5f0e8",
                margin: 0,
                fontWeight: 600,
                letterSpacing: "0.02em",
                fontSize: collapsed ? 14 : 16,
                textAlign: collapsed ? "center" : "left",
              }}
            >
              {collapsed ? "FT" : "Fashion Admin"}
            </Typography.Title>
            {!collapsed && (
              <Typography.Text
                style={{ color: "rgba(245,240,232,0.55)", fontSize: 12 }}
              >
                Fashion & accessories
              </Typography.Text>
            )}
          </div>
          <Menu
            mode="inline"
            theme="dark"
            selectedKeys={[selectedKey]}
            style={{
              background: "transparent",
              border: "none",
              marginTop: 8,
            }}
            items={menuItems.map((item) => ({
              ...item,
              style: { margin: "4px 8px", borderRadius: 8 },
            }))}
          />
        </Sider>
        <Layout>
          <Header
            style={{
              padding: "0 20px",
              background: "#fff",
              borderBottom: "1px solid #ece8e4",
              lineHeight: "64px",
              height: 64,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: "100%",
              }}
            >
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{ fontSize: 18, width: 48, height: 48 }}
              />
              <Dropdown menu={{ items: dropdownItems }} trigger={["click"]}>
                <a
                  onClick={(e) => e.preventDefault()}
                  style={{ color: "#1a1520", fontWeight: 500 }}
                >
                  <Space align="center">
                    <Tag color="volcano" style={{ margin: 0 }}>
                      Admin
                    </Tag>
                    <Tag style={{ margin: 0 }}>{roleLabel}</Tag>
                  </Space>
                </a>
              </Dropdown>
            </div>
          </Header>
          <Content
            style={{
              margin: 20,
              minHeight: 280,
              overflow: "auto",
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default LayoutAdmin;
